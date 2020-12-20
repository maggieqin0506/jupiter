package com.laioffer.job.db;


import com.laioffer.job.entity.Item;

import java.sql.*;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

// handle all the connection to the database
public class MySQLConnection {
    // basic setup

    private Connection conn;

    public MySQLConnection() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver").newInstance();
            conn = DriverManager.getConnection(MySQLDBUtil.URL);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // after use, close the connection
    public void close() {
        if (conn != null) {
            try {
                conn.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    // add API

    // functionality: save items to the database
    public void saveItem(Item item) {
        // first check connection
        if (conn == null) {
            System.err.println("DB connection failed");
            return;
        }
        // IGNORE - if the item exists, then ignore, don't put into the db

        String insertItemSql = "INSERT IGNORE INTO items VALUES (?, ?, ?, ?, ?)";
        try {
            PreparedStatement statement = conn.prepareStatement(insertItemSql);
            // fill in the value, each ? is filled
            statement.setString(1, item.getId());
            statement.setString(2, item.getTitle());
            statement.setString(3, item.getLocation());
            statement.setString(4, item.getCompanyLogo());
            statement.setString(5, item.getUrl());
            statement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }

        String insertKeywordSql = "INSERT IGNORE INTO keywords VALUES (?, ?)";
        try {
            for (String keyword : item.getKeywords()) {
                PreparedStatement statement = conn.prepareStatement(insertKeywordSql);
                statement = conn.prepareStatement(insertKeywordSql);
                statement.setString(1, item.getId());
                statement.setString(2, keyword);
                statement.executeUpdate();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

    }

    public void setFavoriteItems(String userId, Item item) {
        if (conn == null) {
            System.err.println("DB connection failed");
            return;
        }
        saveItem(item);
        // ? - to be assigned
        String sql = "INSERT IGNORE INTO history (user_id, item_id) VALUES (?, ?)";
        try {
            PreparedStatement statement = conn.prepareStatement(sql);
            // note the positional index
            statement.setString(1, userId);
            statement.setString(2, item.getId());
            statement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void unsetFavoriteItems(String userId, String itemId) {
        if (conn == null) {
            System.err.println("DB connection failed");
            return;
        }
        String sql = "DELETE FROM history WHERE user_id = ? AND item_id = ?";
        try {
            PreparedStatement statement = conn.prepareStatement(sql);
            statement.setString(1, userId);
            statement.setString(2, itemId);
            statement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public Set<String> getFavoriteItemIds(String userId) {
        if (conn == null) {
            System.err.println("DB connection failed");
            return new HashSet<>();
        }

        Set<String> favoriteItems = new HashSet<>();

        try {
            String sql = "SELECT item_id FROM history WHERE user_id = ?";
            PreparedStatement statement = conn.prepareStatement(sql);
            statement.setString(1, userId);
            // SQL result set
            ResultSet rs = statement.executeQuery();
            // have multiple results
            // rs - iterator
            while (rs.next()) {
                String itemId = rs.getString("item_id");
                favoriteItems.add(itemId);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return favoriteItems;
    }

    public Set<Item> getFavoriteItems(String userId) {
        if (conn == null) {
            System.err.println("DB connection failed");
            return new HashSet<>();
        }
        Set<Item> favoriteItems = new HashSet<>();
        Set<String> favoriteItemIds = getFavoriteItemIds(userId);

        // SELECT * : select all columns
        // find the item given the itemid
        String sql = "SELECT * FROM items WHERE item_id = ?";
        try {
            PreparedStatement statement = conn.prepareStatement(sql);
            // loop all itemID
            for (String itemId : favoriteItemIds) {
                statement.setString(1, itemId);
                // get the favorite item by query
                ResultSet rs = statement.executeQuery();
                if (rs.next()) {
                    // set up favorite items
                    favoriteItems.add(new Item(rs.getString("item_id")
                            ,rs.getString("name")
                            ,rs.getString("address")
                            ,rs.getString("image_url")
                            ,rs.getString("url")
                            ,null
                            , getKeywords(itemId)
                            ,true));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return favoriteItems;
    }

    public Set<String> getKeywords(String itemId) {
        if (conn == null) {
            System.err.println("DB connection failed");
            return Collections.emptySet();
        }
        Set<String> keywords = new HashSet<>();
        String sql = "SELECT keyword from keywords WHERE item_id = ? ";
        try {
            PreparedStatement statement = conn.prepareStatement(sql);
            statement.setString(1, itemId);
            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                String keyword = rs.getString("keyword");
                keywords.add(keyword);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return keywords;
    }

    // welcome message
    public String getFullname(String userId) {
        if (conn == null) {
            System.err.println("DB connection failed");
            return "";
        }
        String name = "";
        String sql = "SELECT first_name, last_name FROM users WHERE user_id = ?";
        try {
            PreparedStatement statement = conn.prepareStatement(sql);
            statement.setString(1, userId);
            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                name = rs.getString("first_name") + " " + rs.getString("last_name");
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
        return name;
    }

    // check if the userID and password is matched
    public boolean verifyLogin(String userId, String password) {
        if (conn == null) {
            System.err.println("DB connection failed");
            return false;
        }

        String sql = "SELECT user_id FROM users WHERE user_id = ? AND password = ?";
        try {
            PreparedStatement statement = conn.prepareStatement(sql);
            statement.setString(1, userId);
            statement.setString(2, password);
            ResultSet rs = statement.executeQuery();
            // check if it exist
            if (rs.next()) {
                return true;
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
        return false;
    }

    // register an user
    public boolean addUser(String userId, String password, String firstname, String lastname) {
        if (conn == null) {
            System.err.println("DB connection failed");
            return false;
        }

        String sql = "INSERT IGNORE INTO users VALUES (?, ?, ?, ?)";
        try {
            PreparedStatement statement = conn.prepareStatement(sql);
            statement.setString(1, userId);
            statement.setString(2, password);
            statement.setString(3, firstname);
            statement.setString(4, lastname);

            // 1 - row count changed
            return statement.executeUpdate() == 1;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }


}
