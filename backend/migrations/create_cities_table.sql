-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert Kosovo cities
INSERT INTO cities (id, name) VALUES
  (1, 'Prishtina'),
  (2, 'Prizren'),
  (3, 'Peja'),
  (4, 'Gjakova'),
  (5, 'Mitrovica'),
  (6, 'Ferizaj'),
  (7, 'Gjilan'),
  (8, 'Vushtrri'),
  (9, 'Podujeva'),
  (10, 'Rahovec'),
  (11, 'Suhareka'),
  (12, 'Malisheva'),
  (13, 'Lipjan'),
  (14, 'Kamenica'),
  (15, 'Skenderaj'),
  (16, 'Kacanik'),
  (17, 'Decan'),
  (18, 'Istog'),
  (19, 'Dragash'),
  (20, 'Kline'),
  (21, 'Shtime'),
  (22, 'Obiliq'),
  (23, 'Fushe Kosove'),
  (24, 'Zvecan'),
  (25, 'Leposavic'),
  (26, 'Zubin Potok'),
  (27, 'Junik'),
  (28, 'Hani i Elezit'),
  (29, 'Mamushë'),
  (30, 'Shtërpcë'),
  (31, 'Gracanica'),
  (32, 'Partesh'),
  (33, 'Ranillug'),
  (34, 'Kllokot')
ON DUPLICATE KEY UPDATE name=VALUES(name);

