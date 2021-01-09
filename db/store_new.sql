SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema store
-- -----------------------------------------------------

DROP SCHEMA IF EXISTS `store` ;

-- -----------------------------------------------------
-- Schema store
-- -----------------------------------------------------

CREATE SCHEMA IF NOT EXISTS `store` DEFAULT CHARACTER SET cp1251 COLLATE cp1251_ukrainian_ci;

-- -----------------------------------------------------
-- Table `store`.`brands`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`brands` ;

CREATE TABLE IF NOT EXISTS `store`.`brands` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `brand_name` VARCHAR(50) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL DEFAULT NULL,
  `brand_name_en` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = cp1251
COLLATE = cp1251_ukrainian_ci;

-- -----------------------------------------------------
-- Table `store`.`categories`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`categories` ;

CREATE TABLE IF NOT EXISTS `store`.`categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `category_name` VARCHAR(50) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NOT NULL,
  `category_name_en` VARCHAR(45) NULL DEFAULT NULL,
  `category_name_ru` VARCHAR(45) NULL DEFAULT NULL,
  `is_accessory` INT DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 14
DEFAULT CHARACTER SET = cp1251
COLLATE = cp1251_ukrainian_ci;

-- -----------------------------------------------------
-- Table `store`.`categories_brands`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`categories_brands` ;

CREATE TABLE IF NOT EXISTS `store`.`categories_brands` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `brand_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_categ_brand_brand`
    FOREIGN KEY (`brand_id`)
    REFERENCES `store`.`brands` (`id`),
  CONSTRAINT `fk_categ_brand_categ`
    FOREIGN KEY (`category_id`)
    REFERENCES `store`.`categories` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 66
DEFAULT CHARACTER SET = cp1251
COLLATE = cp1251_ukrainian_ci;

CREATE INDEX `fk_categ_brand_categ_idx` ON `store`.`categories_brands` (`category_id` ASC) VISIBLE;

CREATE INDEX `fk_categ_brand_brand_idx` ON `store`.`categories_brands` (`brand_id` ASC) VISIBLE;

USE `store`;

-- -----------------------------------------------------
-- Table `store`.`users`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`users` ;

CREATE TABLE IF NOT EXISTS `store`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `username` VARCHAR(45) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL DEFAULT NULL,
  `name` VARCHAR(45) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL DEFAULT NULL,
  `current_position` VARCHAR(45) NULL DEFAULT NULL,
  `last_time` VARCHAR(25) NULL DEFAULT NULL,
  `city` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL DEFAULT NULL,
  `selected_category` VARCHAR(200) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL DEFAULT NULL,
  `selected_brand` VARCHAR(200) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL DEFAULT NULL,
  `selected_budget` INT NULL DEFAULT NULL,
  `language` VARCHAR(10) NULL DEFAULT NULL,
  `offset` INT NULL DEFAULT 0,
  `result_id` INT NULL DEFAULT NULL,
  `selected_categories_brands` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL DEFAULT NULL,
  `self_search_count` VARCHAR(10) NULL DEFAULT NULL,
  `selected_many` VARCHAR(1500) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL DEFAULT NULL,
  `selected_memory` INT NULL DEFAULT NULL,
  `selected_diagonal` VARCHAR(10) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `selected_status` VARCHAR(15) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `selected_text` VARCHAR(150) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `selected_date` VARCHAR(10) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `selected_number` VARCHAR(10) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `selected_color` VARCHAR(25) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `selected_mem` INT NULL DEFAULT NULL,
  `invoice_id` INT NULL DEFAULT NULL,
  `inline_message_id` VARCHAR(50) NULL DEFAULT NULL,
  `edit_message_id` INT NULL DEFAULT NULL,
  `sum_message_id` INT NULL DEFAULT NULL,
  `current_key` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `first_action_mailing_execute` VARCHAR(10) NULL,
  `mailing_goods_ref` VARCHAR(2000) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `inline_query` VARCHAR(1500) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL DEFAULT NULL,
  `type_inline_mode` VARCHAR(25) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = cp1251
COLLATE = cp1251_ukrainian_ci;

CREATE UNIQUE INDEX `number_UNIQUE` ON `store`.`users` (`user_id` ASC) VISIBLE;

-- -----------------------------------------------------
-- Table `store`.`goods`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`goods` ;

CREATE TABLE IF NOT EXISTS `store`.`goods` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ms_goods_id` VARCHAR(50) NOT NULL,
  `meta_href` VARCHAR(200) NOT NULL,
  `name` VARCHAR(200) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NOT NULL,
  `code` INT NULL DEFAULT NULL,
  `article` VARCHAR(45) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,   
  `country` VARCHAR(45) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `unit_of_measurement` VARCHAR(50) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `category_brand_id` INT NOT NULL,
  `guarantee_code` VARCHAR(50) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `guarantee_condition` VARCHAR(50) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `estimated_cost` FLOAT NULL,
  `weight` INT NULL,  
  `device_weight` VARCHAR(50) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `package_size` VARCHAR(50) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,   
  `status` VARCHAR(10) NULL,
  `goods_ref` VARCHAR(100) NULL,
  `product_description` VARCHAR(20000) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `product_description_ru` VARCHAR(20000) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,  
  `prepayment_cash_delivery` VARCHAR(50) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `color` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `series` VARCHAR(50) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `connection_type` VARCHAR(50) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `ram` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `rom` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `rom_ssd` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `rom_hdd` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `os` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `cpu` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `main_camera` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `front_camera` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `screen_diagonal` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `display_type` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `screen_resolution` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,  
  `case_material` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `case_type` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `case_protection` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `battery_capacity` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `number_of_sim` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `add_technology` VARCHAR(200) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `wireless_technology` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,  
  `creation_year` VARCHAR(10) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `number_of_cores` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `basic_cpu_frequency` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `drive_type` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `storage_capacity` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `gpu_type` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `gpu` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,  
  `screen_matrix_type` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `digital_tuner` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `smart_tv` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `max_frame_rate` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `max_resolution` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `max_video_resolution` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `matrix_resolution` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `img_stabilization` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `view_angle` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `shoot_underwater` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `max_flight_time` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `remote_range` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `headphones_type` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `acoustic_type` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `way_play_sound` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `total_power` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `purpose_audio` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `age_category` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `power_supply` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `powerbank_func` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `headset_presence` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `moisture_protect` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `clock_shape` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `belt_material` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,  
  `min_height` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `allow_load` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `max_speed` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,  
  `wheel_diameter` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `power_reserve` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `motor_power` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `type_electric_transport` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `type_game_device` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `interface` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,  
  `type_protect_glass` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `cable_type` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `connector_type` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `cable_length` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `buying_price` FLOAT NULL,
  `min_price` FLOAT NULL,
  `price` FLOAT NULL,
  `ref_to_goods` VARCHAR(200) NULL,
  `is_accessory` INT NULL,
  `img_src` VARCHAR(200) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `status_ru` VARCHAR(10) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL, 
  `status_uk` VARCHAR(10) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL, 
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_goods_cat_br`
    FOREIGN KEY (`category_brand_id`)
    REFERENCES `store`.`categories_brands` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_goods_cat_br_idx` ON `store`.`goods` (`category_brand_id` ASC) VISIBLE;

-- -----------------------------------------------------
-- Table `store`.`cart`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`cart` ;

CREATE TABLE IF NOT EXISTS `store`.`cart` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `ms_goods_id` VARCHAR(50) NULL DEFAULT NULL,
  `count` INT NOT NULL,  
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_cart_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `store`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = cp1251
COLLATE = cp1251_ukrainian_ci;

CREATE INDEX `fk_cart_goods_idx` ON `store`.`cart` (`ms_goods_id` ASC) VISIBLE;

CREATE INDEX `fk_cart_users_idx` ON `store`.`cart` (`user_id` ASC) VISIBLE;

-- -----------------------------------------------------
-- Table `store`.`favourites`+
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`favourites` ;

CREATE TABLE IF NOT EXISTS `store`.`favourites` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `ms_goods_id` VARCHAR(50) NULL DEFAULT NULL,
  `prev_price` INT DEFAULT 0,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_favourite_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `store`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = cp1251
COLLATE = cp1251_ukrainian_ci;

CREATE INDEX `fk_favourites_goods_idx` ON `store`.`favourites` (`ms_goods_id` ASC) VISIBLE;

-- -----------------------------------------------------
-- Table `store`.`invoice`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`invoice` ;

CREATE TABLE IF NOT EXISTS `store`.`invoice` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `invoice_ms_id` INT NULL DEFAULT NULL,  
  `goods_id` VARCHAR(2000) NULL DEFAULT NULL,  
  `counterparty_id` VARCHAR(200) NULL DEFAULT NULL,  
  `counterparty_contact_id` VARCHAR(200) NULL DEFAULT NULL,  
  `own_contact` VARCHAR(15) NULL,
  `own_full_name` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,  
  `is_recipient` VARCHAR(10) NULL,
  `locality` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `recipient_contact` VARCHAR(15) NULL,
  `recipient_full_name` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `address_number_department` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `type_delivery` VARCHAR(45) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `type_payment` VARCHAR(20) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `require_confirm` VARCHAR(20) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `is_correct` VARCHAR(10) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,  
  `is_payment` VARCHAR(10) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `sum` INT NULL DEFAULT NULL,
  `consignment_note` VARCHAR(20) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `status` VARCHAR(25) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL, 
  `date` VARCHAR(25) NULL DEFAULT NULL,   
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = cp1251
COLLATE = cp1251_ukrainian_ci;

-- -----------------------------------------------------
-- Table `store`.`np_company_localities`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`np_company_localities` ;

CREATE TABLE `np_company_localities`(
  `id` INT NOT NULL AUTO_INCREMENT, 
  `name` VARCHAR(50) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NOT NULL,  
  `characteristic` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NOT NULL,  
  `ref` VARCHAR(100) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB; 

-- -----------------------------------------------------
-- Table `store`.`statistics`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`statistics` ;

CREATE TABLE IF NOT EXISTS `store`.`statistics` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_count` INT  DEFAULT 0,
  `ukr_user_count` INT  DEFAULT 0,
  `ru_user_count` INT  DEFAULT 0,
  `no_shares_count` INT  DEFAULT 0,
  `order_payment_count` INT  DEFAULT 0,
  `to_site_count` INT DEFAULT 0,
  `with_budget_count` INT  DEFAULT 0,
  `favourite_count` INT  DEFAULT 0,
  `active_time` VARCHAR(25) NULL,
  `smart_search_count` INT  DEFAULT 0,
  `tracking_count` INT DEFAULT 0,
  `city_lviv_count` INT DEFAULT 0,
  `other_city_count` INT DEFAULT 0,
  `guarantee_count` INT DEFAULT 0,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `store`.`questions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `store`.`questions` ;

CREATE TABLE IF NOT EXISTS `store`.`questions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `question` VARCHAR(1000) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `answer` VARCHAR(1000) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `is_solved` VARCHAR(10) NULL,
  PRIMARY KEY (`id`))  
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = cp1251
COLLATE = cp1251_ukrainian_ci;

-- -----------------------------------------------------
-- Table `store`.`answer_questions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `store`.`answer_questions` ;

CREATE TABLE IF NOT EXISTS `store`.`answer_questions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(45) NULL,
  `number` INT NULL,
  `question` VARCHAR(1000) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `answer` VARCHAR(1000) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `url` VARCHAR(200) NULL,
  `count` INT DEFAULT 0,
  `user_id` INT NULL,
  `is_solved` VARCHAR(10) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = cp1251
COLLATE = cp1251_ukrainian_ci;

-- -----------------------------------------------------
-- Table `store`.`all_status`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`all_status` ;

CREATE TABLE IF NOT EXISTS `store`.`all_status` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `status` VARCHAR(15) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `status_uk` VARCHAR(15) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `status_ru` VARCHAR(15) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
PRIMARY KEY (`id`))  
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = cp1251
COLLATE = cp1251_ukrainian_ci;

INSERT INTO `store`.`all_status` (status, status_uk, status_ru) VALUES ('New', 'Новий', 'Новый'); 
INSERT INTO `store`.`all_status` (status, status_uk, status_ru) VALUES ('Used', 'Вживаний', 'Б/у');  

-- -----------------------------------------------------
-- Table `store`.`mailing`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`mailing` ;

CREATE TABLE IF NOT EXISTS `store`.`mailing` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `mailing_sheet_id` INT NOT NULL,
  `mailing_type` VARCHAR(15) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `crater_filter` VARCHAR(1000) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `users_count` INT NULL DEFAULT 0,
  `message` VARCHAR(1000) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `additional` VARCHAR(1000) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NULL,
  `conversion_users` INT NULL DEFAULT 0,
  `date` VARCHAR(25) NULL,
  `status` VARCHAR(15) NULL, 
  `view` VARCHAR(15) NULL,  
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `store`.`active_mailing`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`active_mailing` ;

CREATE TABLE IF NOT EXISTS `store`.`active_mailing` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `status` VARCHAR(10) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  `bot_schedule_mailing` INT DEFAULT 5,
  `cron_schedule_mailing` INT DEFAULT 5,
PRIMARY KEY (`id`))  
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = cp1251
COLLATE = cp1251_ukrainian_ci;

-- -----------------------------------------------------
-- Table `store`.`counterparty`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`counterparty` ;

CREATE TABLE IF NOT EXISTS `store`.`counterparty` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `counterparty_id` VARCHAR(45) NOT NULL,
  `full_name` VARCHAR(1000) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci' NOT NULL,
  `phone` VARCHAR(25) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = cp1251
COLLATE = cp1251_ukrainian_ci;

-- -----------------------------------------------------
-- Table `store`.`exchange_rate`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`exchange_rate`;

CREATE TABLE IF NOT EXISTS `store`.`exchange_rate` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date` VARCHAR(45) NULL,
  `current_exchange_rate` FLOAT NULL DEFAULT 0,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `store`.`user_statistics`+
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`user_statistics`;

CREATE TABLE IF NOT EXISTS `store`.`user_statistics` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL,
  `crater` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = cp1251
COLLATE = cp1251_ukrainian_ci;

-- -----------------------------------------------------
-- Table `store`.`users_active_times`+
-- -----------------------------------------------------

DROP TABLE IF EXISTS `store`.`users_active_times_history`;

CREATE TABLE IF NOT EXISTS `store`.`users_active_times_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL,
  `time_period` INT NULL,
  `crater` VARCHAR(100) CHARACTER SET 'cp1251' COLLATE 'cp1251_ukrainian_ci'  NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = cp1251
COLLATE = cp1251_ukrainian_ci;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
