package com.laioffer.job.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

public class HistoryRequestBody {
    // different name between post id and class naming
    @JsonProperty("user_id")
    public String userId;

    public Item favorite;

}
