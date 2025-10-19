mysqldump: [Warning] Using a password on the command line interface can be insecure.
-- MySQL dump 10.13  Distrib 8.0.42, for macos15.2 (arm64)
--
-- Host: localhost    Database: apartment_management
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`),
  UNIQUE KEY `name_7` (`name`),
  UNIQUE KEY `name_8` (`name`),
  UNIQUE KEY `name_9` (`name`),
  UNIQUE KEY `name_10` (`name`),
  UNIQUE KEY `name_11` (`name`),
  UNIQUE KEY `name_12` (`name`),
  UNIQUE KEY `name_13` (`name`),
  UNIQUE KEY `name_14` (`name`),
  UNIQUE KEY `name_15` (`name`),
  UNIQUE KEY `name_16` (`name`),
  UNIQUE KEY `name_17` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'Prishtina','2025-10-15 13:14:19','2025-10-15 13:14:19'),(2,'Prizren','2025-10-15 13:14:19','2025-10-15 13:14:19'),(3,'Peja','2025-10-15 13:14:19','2025-10-15 13:14:19'),(4,'Gjakova','2025-10-15 13:14:19','2025-10-15 13:14:19'),(5,'Mitrovica','2025-10-15 13:14:19','2025-10-15 13:14:19'),(6,'Ferizaj','2025-10-15 13:14:19','2025-10-15 13:14:19'),(7,'Gjilan','2025-10-15 13:14:19','2025-10-15 13:14:19'),(8,'Vushtrri','2025-10-15 13:14:19','2025-10-15 18:41:44'),(9,'Podujeva','2025-10-15 13:14:19','2025-10-15 13:14:19'),(10,'Rahovec','2025-10-15 13:14:19','2025-10-15 13:14:19'),(11,'Suhareka','2025-10-15 13:14:19','2025-10-15 13:14:19'),(12,'Malisheva','2025-10-15 13:14:19','2025-10-15 13:14:19'),(13,'Lipjan','2025-10-15 13:14:19','2025-10-15 13:14:19'),(14,'Kamenica','2025-10-15 13:14:19','2025-10-15 13:14:19'),(15,'Skenderaj','2025-10-15 13:14:19','2025-10-15 13:14:19'),(16,'Kacanik','2025-10-15 13:14:19','2025-10-15 13:14:19'),(17,'Deçan','2025-10-15 13:14:19','2025-10-15 16:19:48'),(18,'Istog','2025-10-15 13:14:19','2025-10-15 13:14:19'),(19,'Dragash','2025-10-15 13:14:19','2025-10-15 13:14:19'),(20,'Kline','2025-10-15 13:14:19','2025-10-15 13:14:19'),(21,'Shtime','2025-10-15 13:14:19','2025-10-15 13:14:19'),(22,'Obiliq','2025-10-15 13:14:19','2025-10-15 13:14:19'),(23,'Fushë Kosovë','2025-10-15 13:14:19','2025-10-17 08:22:08'),(25,'Leposavic','2025-10-15 13:14:19','2025-10-15 13:14:19'),(26,'Zubin Potok','2025-10-15 13:14:19','2025-10-15 13:14:19'),(27,'Junik','2025-10-15 13:14:19','2025-10-15 13:14:19'),(28,'Hani i Elezit','2025-10-15 13:14:19','2025-10-15 13:14:19'),(29,'Mamushë','2025-10-15 13:14:19','2025-10-15 13:14:19'),(30,'Shtërpcë','2025-10-15 13:14:19','2025-10-15 13:14:19'),(31,'Gracanica','2025-10-15 13:14:19','2025-10-15 13:14:19'),(32,'Partesh','2025-10-15 13:14:19','2025-10-15 13:14:19'),(33,'Ranillug','2025-10-15 13:14:19','2025-10-15 13:14:19'),(34,'Kllokot','2025-10-15 13:14:19','2025-10-15 13:14:19');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaints`
--

DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_user_id` int NOT NULL,
  `property_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `status` enum('pending','in_progress','resolved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `response` text COMMENT 'Property manager response when resolving/rejecting the complaint',
  PRIMARY KEY (`id`),
  KEY `tenant_user_id` (`tenant_user_id`),
  KEY `property_id` (`property_id`),
  CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`tenant_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `complaints_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaints`
--

LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
INSERT INTO `complaints` VALUES (1,8,3,'Ankese','Descr i ankeses','pending','2025-10-16 20:35:42','2025-10-16 20:35:42',NULL),(2,10,6,'Berllog ne rrug','Hej kqyr ka berllog kati 10','pending','2025-10-17 08:05:00','2025-10-17 08:05:00',NULL),(3,10,6,'Qelma Deren','Hej','pending','2025-10-18 14:22:19','2025-10-18 14:22:19',NULL),(4,10,6,'Hi','Hi','resolved','2025-10-18 20:25:15','2025-10-18 20:53:32','');
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `executed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `filename` (`filename`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'create_complaints_table.sql','2025-10-19 14:03:55'),(2,'create_problem_options_tables.sql','2025-10-19 14:03:55'),(3,'create_reports_table.sql','2025-10-19 14:03:55'),(4,'create_spending_configs_tables.sql','2025-10-19 14:03:55'),(5,'create_suggestions_table.sql','2025-10-19 14:03:55'),(6,'create_tenant_payments_table.sql','2025-10-19 14:03:55'),(7,'add_expiry_date_to_users.sql','2025-10-19 14:06:19'),(8,'add_floor_assigned_to_users.sql','2025-10-19 14:06:19'),(9,'add_monthly_rate_to_users.sql','2025-10-19 14:06:19'),(10,'add_monthly_reports_table.sql','2025-10-19 14:06:19'),(11,'add_response_to_complaints.sql','2025-10-19 14:06:19'),(12,'add_response_to_suggestions.sql','2025-10-19 14:06:19');
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monthly_reports`
--

DROP TABLE IF EXISTS `monthly_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `report_month` date NOT NULL COMMENT 'First day of the month for this report',
  `generated_by_user_id` int NOT NULL,
  `total_budget` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Total collected from paid tenants',
  `total_tenants` int NOT NULL DEFAULT '0',
  `paid_tenants` int NOT NULL DEFAULT '0',
  `pending_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `spending_breakdown` json DEFAULT NULL COMMENT 'JSON array of spending allocations per config',
  `notes` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_property_month_report` (`property_id`,`report_month`),
  KEY `idx_report_property_id` (`property_id`),
  KEY `idx_report_month` (`report_month`),
  KEY `idx_generated_by_user_id` (`generated_by_user_id`),
  CONSTRAINT `monthly_reports_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `monthly_reports_ibfk_2` FOREIGN KEY (`generated_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monthly_reports`
--

LOCK TABLES `monthly_reports` WRITE;
/*!40000 ALTER TABLE `monthly_reports` DISABLE KEYS */;
INSERT INTO `monthly_reports` VALUES (2,6,'2025-09-30',5,15.00,1,1,0.00,'[{\"config_id\": 1, \"percentage\": \"26.67\", \"description\": \"Shpenzimet mujore te energjise elektrike\", \"config_title\": \"Energjia Elektrike\", \"allocated_amount\": 4}, {\"config_id\": 2, \"percentage\": \"40.00\", \"description\": \"Shpenzimet mujore per mirembajtjen e ashensorit\", \"config_title\": \"Ashensori\", \"allocated_amount\": 6}, {\"config_id\": 3, \"percentage\": \"33.33\", \"description\": \"Shpenzimet mujore për kompaninë e pastrimit\", \"config_title\": \"Pastrimi\", \"allocated_amount\": 5}]','Note','2025-10-17 11:11:29','2025-10-17 11:25:28'),(3,6,'2025-10-01',5,15.00,1,1,0.00,'[{\"config_id\": 1, \"percentage\": \"6.67\", \"description\": \"Shpenzimet mujore te energjise elektrike\", \"config_title\": \"Energjia Elektrike\", \"allocated_amount\": 1}, {\"config_id\": 2, \"percentage\": \"46.67\", \"description\": \"Shpenzimet mujore per mirembajtjen e ashensorit\", \"config_title\": \"Ashensori\", \"allocated_amount\": 7}, {\"config_id\": 3, \"percentage\": \"46.67\", \"description\": \"Shpenzimet mujore për kompaninë e pastrimit\", \"config_title\": \"Pastrimi\", \"allocated_amount\": 7}]',NULL,'2025-10-17 16:57:42','2025-10-17 16:57:42'),(5,7,'2025-10-01',5,13.00,1,1,0.00,'[{\"config_id\": 1, \"percentage\": \"33.33\", \"description\": \"Shpenzimet mujore te energjise elektrike\", \"config_title\": \"Energjia Elektrike\", \"allocated_amount\": 4.333333333333333}, {\"config_id\": 2, \"percentage\": \"33.33\", \"description\": \"Shpenzimet mujore per mirembajtjen e ashensorit\", \"config_title\": \"Ashensori\", \"allocated_amount\": 4.333333333333333}, {\"config_id\": 3, \"percentage\": \"33.33\", \"description\": \"Shpenzimet mujore për kompaninë e pastrimit\", \"config_title\": \"Pastrimi\", \"allocated_amount\": 4.333333333333333}]',NULL,'2025-10-18 14:21:00','2025-10-18 14:21:15'),(8,3,'2025-11-01',5,30.00,2,2,0.00,'[{\"config_id\": 1, \"percentage\": \"33.33\", \"description\": \"Shpenzimet mujore te energjise elektrike\", \"config_title\": \"Energjia Elektrike\", \"allocated_amount\": 10}, {\"config_id\": 2, \"percentage\": \"33.33\", \"description\": \"Shpenzimet mujore per mirembajtjen e ashensorit\", \"config_title\": \"Ashensori\", \"allocated_amount\": 10}, {\"config_id\": 3, \"percentage\": \"33.33\", \"description\": \"Shpenzimet mujore për kompaninë e pastrimit\", \"config_title\": \"Pastrimi\", \"allocated_amount\": 10}]',NULL,'2025-10-18 19:49:56','2025-10-18 19:49:56'),(9,3,'2025-10-01',5,30.00,2,2,0.00,'[{\"config_id\": 1, \"percentage\": \"33.33\", \"description\": \"Shpenzimet mujore te energjise elektrike\", \"config_title\": \"Energjia Elektrike\", \"allocated_amount\": 10}, {\"config_id\": 2, \"percentage\": \"33.33\", \"description\": \"Shpenzimet mujore per mirembajtjen e ashensorit\", \"config_title\": \"Ashensori\", \"allocated_amount\": 10}, {\"config_id\": 3, \"percentage\": \"33.33\", \"description\": \"Shpenzimet mujore për kompaninë e pastrimit\", \"config_title\": \"Pastrimi\", \"allocated_amount\": 10}]',NULL,'2025-10-18 19:53:46','2025-10-18 19:53:46');
/*!40000 ALTER TABLE `monthly_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problem_options`
--

DROP TABLE IF EXISTS `problem_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_by_user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_created_by` (`created_by_user_id`),
  CONSTRAINT `problem_options_ibfk_1` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problem_options`
--

LOCK TABLES `problem_options` WRITE;
/*!40000 ALTER TABLE `problem_options` DISABLE KEYS */;
INSERT INTO `problem_options` VALUES (1,'Drita','Prishje / Instalim i dritave ne ndertese.',5,'2025-10-16 13:02:56','2025-10-16 13:02:56'),(2,'Mbeturina','Sasi e mbeturinave ne ndertese.',5,'2025-10-16 13:04:32','2025-10-16 13:04:32'),(3,'Rrjedhje Uji',NULL,5,'2025-10-17 08:27:36','2025-10-17 08:27:36');
/*!40000 ALTER TABLE `problem_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `properties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `address` varchar(255) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `property_manager_user_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `city_id` int NOT NULL,
  `floors_from` smallint DEFAULT NULL,
  `floors_to` smallint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `privileged_user_id` (`property_manager_user_id`),
  KEY `city_id` (`city_id`),
  CONSTRAINT `properties_ibfk_25` FOREIGN KEY (`property_manager_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `properties_ibfk_26` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES (3,'Banesa Te Manate','Manate',42.82384175,20.97708517,NULL,'2025-10-15 18:39:05','2025-10-15 22:30:45',8,-20,30),(5,'Hi','123',NULL,NULL,NULL,'2025-10-15 23:38:21','2025-10-15 23:38:21',25,NULL,NULL),(6,'Banesa Redonit','Rruga Tirana',42.78554629,21.01697710,NULL,'2025-10-17 08:00:32','2025-10-17 08:00:32',23,-2,25),(7,'Hor','Hora',40.74179464,-73.97987366,NULL,'2025-10-18 14:17:43','2025-10-18 14:17:43',8,-1,12);
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_managers`
--

DROP TABLE IF EXISTS `property_managers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_managers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `property_managers_user_id_property_id_unique` (`property_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `property_managers_ibfk_45` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `property_managers_ibfk_46` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_managers`
--

LOCK TABLES `property_managers` WRITE;
/*!40000 ALTER TABLE `property_managers` DISABLE KEYS */;
INSERT INTO `property_managers` VALUES (5,3,5,'2025-10-15 18:39:05'),(6,5,5,'2025-10-15 23:38:21'),(7,6,5,'2025-10-17 08:00:32'),(8,7,5,'2025-10-18 14:17:43');
/*!40000 ALTER TABLE `property_managers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_problem_options`
--

DROP TABLE IF EXISTS `property_problem_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_problem_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `problem_option_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_property_problem` (`property_id`,`problem_option_id`),
  KEY `idx_property` (`property_id`),
  KEY `idx_problem_option` (`problem_option_id`),
  CONSTRAINT `property_problem_options_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `property_problem_options_ibfk_2` FOREIGN KEY (`problem_option_id`) REFERENCES `problem_options` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_problem_options`
--

LOCK TABLES `property_problem_options` WRITE;
/*!40000 ALTER TABLE `property_problem_options` DISABLE KEYS */;
INSERT INTO `property_problem_options` VALUES (1,5,1,'2025-10-16 13:03:05'),(2,3,2,'2025-10-16 13:04:42'),(3,3,1,'2025-10-16 13:04:42'),(6,6,1,'2025-10-17 16:37:06'),(7,6,3,'2025-10-17 16:37:06');
/*!40000 ALTER TABLE `property_problem_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_spending_configs`
--

DROP TABLE IF EXISTS `property_spending_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_spending_configs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `spending_config_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `property_spending_configs_spending_config_id_property_id_unique` (`property_id`,`spending_config_id`),
  KEY `spending_config_id` (`spending_config_id`),
  CONSTRAINT `property_spending_configs_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `property_spending_configs_ibfk_2` FOREIGN KEY (`spending_config_id`) REFERENCES `spending_configs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_spending_configs`
--

LOCK TABLES `property_spending_configs` WRITE;
/*!40000 ALTER TABLE `property_spending_configs` DISABLE KEYS */;
INSERT INTO `property_spending_configs` VALUES (1,6,3,'2025-10-17 10:35:12'),(2,6,2,'2025-10-17 10:35:12'),(3,6,1,'2025-10-17 10:35:12'),(4,7,3,'2025-10-18 14:20:29'),(5,7,2,'2025-10-18 14:20:29'),(6,7,1,'2025-10-18 14:20:29'),(7,3,2,'2025-10-18 19:47:12'),(8,3,3,'2025-10-18 19:47:12'),(9,3,1,'2025-10-18 19:47:12');
/*!40000 ALTER TABLE `property_spending_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `register_requests`
--

DROP TABLE IF EXISTS `register_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `register_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `surname` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `number` varchar(20) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `email_22` (`email`),
  UNIQUE KEY `email_23` (`email`),
  UNIQUE KEY `email_24` (`email`),
  UNIQUE KEY `email_25` (`email`),
  UNIQUE KEY `email_26` (`email`),
  UNIQUE KEY `email_27` (`email`),
  UNIQUE KEY `email_28` (`email`),
  UNIQUE KEY `email_29` (`email`),
  UNIQUE KEY `email_30` (`email`),
  UNIQUE KEY `email_31` (`email`),
  UNIQUE KEY `email_32` (`email`),
  UNIQUE KEY `email_33` (`email`),
  UNIQUE KEY `email_34` (`email`),
  UNIQUE KEY `email_35` (`email`),
  UNIQUE KEY `email_36` (`email`),
  UNIQUE KEY `email_37` (`email`),
  UNIQUE KEY `email_38` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `register_requests`
--

LOCK TABLES `register_requests` WRITE;
/*!40000 ALTER TABLE `register_requests` DISABLE KEYS */;
INSERT INTO `register_requests` VALUES (17,'test','test','t@t.com','$2b$10$wLuw3AHxB3AnIPHoOhd4HeRYjVmiDvbaMc/pB5TjmF9OFGU76Heba','+38344887990','pending','2025-10-18 20:12:13','2025-10-18 20:12:13');
/*!40000 ALTER TABLE `register_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `problem_option_id` int NOT NULL,
  `tenant_user_id` int NOT NULL,
  `floor` smallint DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','in_progress','resolved','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_reports_problem_option` (`problem_option_id`),
  KEY `idx_reports_property` (`property_id`),
  KEY `idx_reports_tenant` (`tenant_user_id`),
  KEY `idx_reports_status` (`status`),
  KEY `idx_reports_created_at` (`created_at`),
  CONSTRAINT `fk_reports_problem_option` FOREIGN KEY (`problem_option_id`) REFERENCES `problem_options` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reports_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reports_tenant` FOREIGN KEY (`tenant_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
INSERT INTO `reports` VALUES (1,3,1,8,27,NULL,'resolved','2025-10-16 13:29:40','2025-10-16 17:02:21'),(2,6,3,10,-2,NULL,'resolved','2025-10-17 08:28:13','2025-10-17 08:28:45'),(3,6,1,10,9,NULL,'in_progress','2025-10-18 14:22:09','2025-10-18 20:53:43'),(4,6,1,10,6,NULL,'resolved','2025-10-18 20:25:05','2025-10-18 20:45:53');
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spending_configs`
--

DROP TABLE IF EXISTS `spending_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spending_configs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `created_by_user_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by_user_id` (`created_by_user_id`),
  CONSTRAINT `spending_configs_ibfk_1` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spending_configs`
--

LOCK TABLES `spending_configs` WRITE;
/*!40000 ALTER TABLE `spending_configs` DISABLE KEYS */;
INSERT INTO `spending_configs` VALUES (1,'Energjia Elektrike','Shpenzimet mujore te energjise elektrike',5,'2025-10-17 08:50:33','2025-10-17 08:50:33'),(2,'Ashensori','Shpenzimet mujore per mirembajtjen e ashensorit',5,'2025-10-17 08:50:59','2025-10-17 08:51:21'),(3,'Pastrimi','Shpenzimet mujore për kompaninë e pastrimit',5,'2025-10-17 08:51:17','2025-10-17 08:51:17');
/*!40000 ALTER TABLE `spending_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suggestions`
--

DROP TABLE IF EXISTS `suggestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suggestions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_user_id` int NOT NULL,
  `property_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `status` enum('pending','in_progress','resolved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `response` text COMMENT 'Property manager response when resolving/rejecting the suggestion',
  PRIMARY KEY (`id`),
  KEY `tenant_user_id` (`tenant_user_id`),
  KEY `property_id` (`property_id`),
  CONSTRAINT `suggestions_ibfk_1` FOREIGN KEY (`tenant_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `suggestions_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suggestions`
--

LOCK TABLES `suggestions` WRITE;
/*!40000 ALTER TABLE `suggestions` DISABLE KEYS */;
INSERT INTO `suggestions` VALUES (1,8,3,'Sugjerim','SDesd i Sugjerimit','pending','2025-10-16 20:35:51','2025-10-16 20:35:51',NULL),(2,10,6,'Lifti me leda','A munum me bo me leda liftin se ma najs','resolved','2025-10-17 08:05:12','2025-10-17 08:05:54','U kry!'),(3,10,6,'Heee','Heee','pending','2025-10-18 20:25:20','2025-10-18 20:25:20',NULL);
/*!40000 ALTER TABLE `suggestions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_payments`
--

DROP TABLE IF EXISTS `tenant_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `property_id` int NOT NULL,
  `payment_month` date NOT NULL COMMENT 'First day of the month for this payment',
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','overdue') NOT NULL DEFAULT 'pending',
  `payment_date` date DEFAULT NULL COMMENT 'Actual date when payment was marked as paid',
  `notes` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tenant_property_month` (`tenant_id`,`property_id`,`payment_month`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_property_id` (`property_id`),
  KEY `idx_payment_month` (`payment_month`),
  KEY `idx_status` (`status`),
  CONSTRAINT `tenant_payments_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tenant_payments_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_payments`
--

LOCK TABLES `tenant_payments` WRITE;
/*!40000 ALTER TABLE `tenant_payments` DISABLE KEYS */;
INSERT INTO `tenant_payments` VALUES (1,8,3,'2025-10-01',15.00,'paid','2025-10-18',NULL,'2025-10-17 07:20:24','2025-10-18 20:16:46'),(2,9,3,'2025-10-01',15.00,'paid','2025-10-18',NULL,'2025-10-17 07:52:49','2025-10-18 20:16:43'),(3,10,6,'2025-10-01',15.00,'paid','2025-10-18',NULL,'2025-10-17 08:01:23','2025-10-18 20:16:40'),(4,10,6,'2025-09-01',15.00,'paid','2025-10-17',NULL,'2025-10-17 16:38:20','2025-10-17 16:38:21'),(5,12,7,'2025-09-30',13.00,'paid','2025-10-10',NULL,'2025-10-18 14:18:48','2025-10-18 14:19:45'),(6,12,7,'2025-10-01',13.00,'paid','2025-10-18',NULL,'2025-10-18 14:19:04','2025-10-18 20:16:26'),(7,9,3,'2025-11-01',15.00,'paid','2025-10-18',NULL,'2025-10-18 15:03:04','2025-10-18 15:03:04'),(8,8,3,'2025-11-01',15.00,'paid','2025-10-18',NULL,'2025-10-18 15:03:21','2025-10-18 15:03:21'),(9,8,3,'2025-01-01',15.00,'paid','2025-10-18',NULL,'2025-10-18 20:08:38','2025-10-18 20:08:38'),(10,9,3,'2025-01-01',15.00,'paid','2025-10-18',NULL,'2025-10-18 20:08:38','2025-10-18 20:08:38'),(11,8,3,'2025-04-01',15.00,'paid','2025-10-18',NULL,'2025-10-18 20:09:29','2025-10-18 20:09:29'),(12,9,3,'2025-04-01',15.00,'paid','2025-10-18',NULL,'2025-10-18 20:09:29','2025-10-18 20:09:29'),(13,8,3,'2025-05-01',15.00,'paid','2025-10-18',NULL,'2025-10-18 20:09:29','2025-10-18 20:09:29'),(14,9,3,'2025-05-01',15.00,'paid','2025-10-18',NULL,'2025-10-18 20:09:29','2025-10-18 20:09:29'),(15,8,3,'2025-06-01',15.00,'paid','2025-10-18',NULL,'2025-10-18 20:09:29','2025-10-18 20:09:29'),(16,9,3,'2025-06-01',15.00,'paid','2025-10-18',NULL,'2025-10-18 20:09:29','2025-10-18 20:09:29');
/*!40000 ALTER TABLE `tenant_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `surname` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `number` varchar(20) DEFAULT NULL,
  `role` enum('admin','property_manager','tenant') NOT NULL DEFAULT 'tenant',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `property_ids` json DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `floor_assigned` smallint DEFAULT NULL,
  `monthly_rate` decimal(10,2) DEFAULT NULL COMMENT 'Monthly rent rate for tenants (applicable only to role=tenant)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_floor_assigned` (`floor_assigned`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Art','Zymeri','artzymeri2001@gmail.com','$2b$10$Gq7bBOP.Z8lLs6RXYo.cFOw90xya5hqQKt9N9sQ7fhwTFVFg1KHze','+38349272792','admin','2025-10-14 12:48:08','2025-10-14 12:48:08',NULL,NULL,NULL,NULL),(2,'Micicul','Micicul','micicul@micicul.com','$2b$10$zKz88PBl8A3C4O9Ny9MCUOTJxjd2PwHsCbq.N/Usbn3z2JjJK8JKa','+38349111111','tenant','2025-10-14 15:24:31','2025-10-14 15:24:31','[]',NULL,NULL,NULL),(3,'Privileg','Priv','privileged@email.com','$2b$10$e19H.Zt2BcrJvnPLTiZTheN6n7W8/m2rw4gbjC8wsNSXrBa.wSBda','+38344111111','property_manager','2025-10-14 17:26:39','2025-10-14 17:26:39','[]','2026-10-15',NULL,NULL),(4,'priv2','priv2','privileged2@gmail.com','$2b$10$cc2vkKgDU1dvuOYZrUK6hO5jsfaF/kwKwONGuxCxuL6tXLMCE67cy','+38349000111','property_manager','2025-10-14 18:07:14','2025-10-15 22:11:20','[]','2025-10-17',NULL,NULL),(5,'Arber','Halili','arberhalili@gmail.com','$2b$10$B0UPhhNMNOEBJsu/q9TPnepnOuU6XFtO6obhpp/pDQeJHxvK79PBK','+38349111222','property_manager','2025-10-15 18:38:08','2025-10-15 18:38:08','[]',NULL,NULL,NULL),(7,'Erjona','Berisha','jona@gmail.com','$2b$10$5ECpkiSssImvk51mb/KqNOnatfG0.9BXvurqqGf.86dxgID5JUE3y','+38349272793','tenant','2025-10-15 23:07:28','2025-10-16 18:20:01','[5]',NULL,10,NULL),(8,'Art','Zymeri','aa@aa.com','$2b$10$f4v.CUk9SSIOeU42rMBAm.vzf7Z5L5LKgaBx3MnZEKpv7Py7.oZ5S',NULL,'tenant','2025-10-15 23:19:56','2025-10-16 18:10:29','[3]',NULL,11,15.00),(9,'Hello','Bro','bro@hello.com','$2b$10$MVeuESvjKq3mvpdASrc5ZO.GbyoA8x1ZV7FrGq/fLxYEM9IaD6vLO','+38349888888','tenant','2025-10-17 07:52:49','2025-10-17 07:52:49','[3]',NULL,14,15.00),(10,'Ridwan','Qerimi','ridwann@qerimi.com','$2b$10$8JzVHSBLId2BLp56rNW8feMhheJpSMQ6FDD6Bokr.Va5XfaCrnZhi','+38349881881','tenant','2025-10-17 08:01:23','2025-10-17 12:30:30','[6]',NULL,10,15.00),(11,'Test','Test','test@test.com','$2b$10$GhBdQjWEuflAkvRTkUrjvu08lwugxsNXqwjqUrRT2k0ZfokQJl5R6','+38344000000','tenant','2025-10-18 13:57:03','2025-10-18 13:57:03','[]',NULL,NULL,NULL),(12,'John','Doe','john@john.com','$2b$10$8XVuQR3tk813s3VL.yJVSetuAzXm2m/KJztovA73o4KO.cwIL9rT6','+8344113113','tenant','2025-10-18 14:18:48','2025-10-18 14:18:48','[7]',NULL,10,13.00),(13,'Drin','Perquku','drin@perquku.com','$2b$10$cN.77RYOPN/qGSfJjOb./.w//F0bAOF8tJ6vTK2OQ18cBvhVLZmye','+38348111222','tenant','2025-10-18 14:26:12','2025-10-18 14:26:12','[]',NULL,NULL,NULL),(21,'AA','aa','info.thecs.store@gmail.com','$2b$10$w9hil38mwymCAqs3OlLIsOdmg/q45.EH8HIRnnqoEPH7WcUjUUoMi','+38349000113','tenant','2025-10-18 18:39:51','2025-10-18 18:39:51','[]',NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-19 16:33:24
