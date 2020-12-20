package com.laioffer.job.servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import org.apache.commons.io.IOUtils;
import org.json.JSONObject;


@WebServlet(name = "ExampleBookServlet", urlPatterns = "/example_book")
public class ExampleBookServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // convert buffer reader to string
        JSONObject jsonRequest = new JSONObject(IOUtils.toString(request.getReader()));
        String title = jsonRequest.getString("title");
        String author = jsonRequest.getString("author");
        String date = jsonRequest.getString("date");
        float price = jsonRequest.getFloat("price");
        String currency = jsonRequest.getString("currency");
        int pages = jsonRequest.getInt("pages");
        String series = jsonRequest.getString("series");
        String language = jsonRequest.getString("language");
        String isbn = jsonRequest.getString("isbn");


        //  This is the process of content negotiation.
        //  Other types of content can be passed too, as long as the client is able to understand it.
        response.setContentType("application/json");
        JSONObject jsonResponse = new JSONObject();
        jsonResponse.put("status", "ok");

        // PrintWriter object output to frontend
        response.getWriter().print(jsonResponse);

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String keyword = request.getParameter("keyword");
        String category = request.getParameter("category");
        // database query by keyword and by category
        System.out.println("Keyword is " + keyword);
        System.out.println("Category is " + category);

        // json type response
        response.setContentType("application/json");
        JSONObject json = new JSONObject();
        json.put("title", "Harry Potter and the Sorcerer's Stone");
        json.put("author", "JK Rowling");
        json.put("date", "October 1, 1998");
        json.put("price", 11.99);
        json.put("currency", "USD");
        json.put("pages", 309);
        json.put("series", "Harry Potter");
        json.put("language", "en_US");
        json.put("isbn", "0590353403");
        response.getWriter().print(json);

    }
}
