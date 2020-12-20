package com.laioffer.job.recommendation;

import com.laioffer.job.db.MySQLConnection;
import com.laioffer.job.entity.Item;
import com.laioffer.job.external.GitHubClient;

import java.util.*;

public class Recommendation {
    public List<Item> recommendedItems(String userId, double lat, double lon){
        List<Item> recommendedItems = new ArrayList<>();

        // step 1: use the connection to get the favorite items ids
        MySQLConnection connection = new MySQLConnection();
        Set<String> favoritedItemIds = connection.getFavoriteItemIds(userId);

        // step 2: deduplicate, and then sort based on the occurrence
        // hashmap: key: keyword, value: count of the keyword
        Map<String, Integer> allKeywords = new HashMap<>();
        for (String itemId : favoritedItemIds) {
            // get the item keyword
            Set<String> keywords = connection.getKeywords(itemId);
            //
            for (String keyword : keywords) {
                allKeywords.put(keyword, allKeywords.getOrDefault(keyword, 0) + 1);
            }
        }
        connection.close();

        // sort based on count
        List<Map.Entry<String, Integer>> keywordList = new ArrayList<>(allKeywords.entrySet());
        keywordList.sort(new Comparator<Map.Entry<String, Integer>>() {
            @Override
            public int compare(Map.Entry<String, Integer> e1, Map.Entry<String, Integer> e2) {
                return Integer.compare(e2.getValue(), e1.getValue());
            }
        });
        // we only want top 3
        if (keywordList.size() > 3) {
            keywordList = keywordList.subList(0, 3);
        }
        Set<String> visitedItemIds =  new HashSet<>();
        GitHubClient client = new GitHubClient();

        // step 3: search based on keywords, filter out favorite items
        for (Map.Entry<String, Integer> keyword : keywordList) {
            // let the github client to search for the keyword
            List<Item> items = client.search(lat, lon, keyword.getKey());
            for (Item item : items) {
                // 1. non-visited 2. non favorited, has to be new one
                if (!favoritedItemIds.contains(item.getId()) && !visitedItemIds.contains(item.getId())) {
                    recommendedItems.add(item);
                    visitedItemIds.add(item.getId());
                }
            }
        }
        return recommendedItems;
    }


}
