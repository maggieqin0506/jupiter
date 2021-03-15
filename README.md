# Jupiter: A Job Recommendation Web Application
Introduction: this is a web application that allows users to browse and apply for jobs that is close to users' location. Furthermore, the website will also recommend jobs according to your browsing history. Users need to register an account in this website.

<img width="1433" alt="Screen Shot 2021-03-14 at 9 40 45 PM" src="https://user-images.githubusercontent.com/54367563/111096613-f2d44a00-850d-11eb-84b0-cf4604dc3192.png">

## Structure Overview

<img width="844" alt="Screen Shot 2021-03-14 at 9 48 58 PM" src="https://user-images.githubusercontent.com/54367563/111097218-1b107880-850f-11eb-888d-5ab801353c00.png">

## Java Servlets
- Implemented RESTful APIs by Java Servlets
- Use JSON format for HTTP requests
- Parsed with Jackson
- Deployed to Tomcat Server

## Github Job API
Official Documentation: https://jobs.github.com/api

## Keyword Extraction Algorithm
TF-IDF algorithm
MonkeyLearn API: https://monkeylearn.com/signup/

## Recommendation Algorithm
Content-based Recommendation Algorithm: Given users' favorited item, recommend items that are similar to what they liked before.
Advantage: since we don't have a lot of data, we could use this algorithm.

## Storage
MySQL

## Registration
Session-based authentication
