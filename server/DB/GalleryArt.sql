--  יצירת בסיס הנתונים
CREATE DATABASE IF NOT EXISTS GalleryArt;
USE GalleryArt;

--  טבלת המשתמשים
CREATE TABLE IF NOT EXISTS Users (
  fullName NVARCHAR(50) NOT NULL,
  userName NVARCHAR(50) NOT NULL,
  email NVARCHAR(50) PRIMARY KEY,
  description NVARCHAR(500),
  password NVARCHAR(50) NOT NULL,
   profilePic NVARCHAR(255) DEFAULT NULL -- תמונת פרופיל אופציונלית
);
--טבלת יצירות
CREATE TABLE IF NOT EXISTS ArtWorks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title NVARCHAR(100),
  likes int DEFAULT 0,
  imagePath NVARCHAR(200) NOT NULL, -- נתיב לתמונה (אפשר לשמור רק שם קובץ אם התמונות באותה תיקיה)
  email NVARCHAR(50) NOT NULL,
  FOREIGN KEY (email) REFERENCES Users(email) 
);
--טבלת קטוגריות
CREATE TABLE IF NOT EXISTS Category (
 id INT AUTO_INCREMENT PRIMARY KEY,
  name NVARCHAR(50) NOT NULL UNIQUE
);
--טבלת תגובות
CREATE TABLE IF NOT EXISTS Comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userEmail NVARCHAR(50) NOT NULL,
  artWorkId INT NOT NULL,
  commentText NVARCHAR(1000) NOT NULL,
  FOREIGN KEY (userEmail) REFERENCES Users(email) ,
  FOREIGN KEY (artworkId) REFERENCES ArtWorks(id) 
);
