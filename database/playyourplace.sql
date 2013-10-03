-- phpMyAdmin SQL Dump
-- version 3.5.8.1
-- http://www.phpmyadmin.net
--
-- Host: localhost:3306
-- Generation Time: Sep 01, 2013 at 08:48 AM
-- Server version: 5.1.69
-- PHP Version: 5.3.10

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `playyourplace`
--

CREATE DATABASE IF NOT EXISTS `playyourplace`;
USE `playyourplace`;

-- --------------------------------------------------------

--
-- Table structure for table `attribution`
--

CREATE TABLE IF NOT EXISTS `attribution` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `originalid` int(10) unsigned NOT NULL,
  `copyid` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;

-- --------------------------------------------------------

--
-- Table structure for table `audio`
--

CREATE TABLE IF NOT EXISTS `audio` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` text NOT NULL,
  `name` text NOT NULL,
  `mp3` text NOT NULL,
  `ogg` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=123 ;

-- --------------------------------------------------------

--
-- Table structure for table `comment`
--

CREATE TABLE IF NOT EXISTS `comment` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tablename` varchar(16) NOT NULL,
  `targetid` int(10) unsigned NOT NULL,
  `comment` varchar(256) NOT NULL,
  `creatorid` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=8 ;

-- --------------------------------------------------------

--
-- Table structure for table `creator`
--

CREATE TABLE IF NOT EXISTS `creator` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(256) NOT NULL,
  `email` varchar(256) NOT NULL,
  `password` varchar(64) NOT NULL,
  `verified` tinyint(1) DEFAULT '0',
  `profile` varchar(512) DEFAULT NULL,
  `thumbnail` varchar(256) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `flagged` tinyint(1) NOT NULL DEFAULT '0',
  `role` int(1) NOT NULL DEFAULT '0',
  `blocked` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=144 ;

-- --------------------------------------------------------

--
-- Table structure for table `level`
--

CREATE TABLE IF NOT EXISTS `level` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `thumbnail` text,
  `creator` bigint(20) unsigned NOT NULL,
  `json` longtext NOT NULL,
  `tags` text,
  `place` text,
  `action` text,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `flagged` tinyint(1) NOT NULL DEFAULT '0',
  `published` tinyint(1) NOT NULL DEFAULT '0',
  `toppick` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=291 ;

-- --------------------------------------------------------

--
-- Table structure for table `media`
--

CREATE TABLE IF NOT EXISTS `media` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `path` text NOT NULL,
  `creator` bigint(20) unsigned NOT NULL,
  `tags` text,
  `type` text,
  `thumbnail` text,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `flagged` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=818 ;

-- --------------------------------------------------------

--
-- Table structure for table `rating`
--

CREATE TABLE IF NOT EXISTS `rating` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `category` varchar(64) NOT NULL,
  `tablename` varchar(16) NOT NULL,
  `targetid` int(10) unsigned NOT NULL,
  `score` int(10) unsigned NOT NULL DEFAULT '0',
  `creatorid` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=124 ;

-- --------------------------------------------------------

--
-- Table structure for table `score`
--

CREATE TABLE IF NOT EXISTS `score` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `creatorid` int(10) unsigned NOT NULL,
  `levelid` int(10) unsigned NOT NULL,
  `score` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=27 ;

--
-- Default data for table `creator`
--
INSERT INTO `creator` (`id`, `name`, `email`, `password`, `verified`, `profile`, `thumbnail`, `created`, `flagged`, `role`, `blocked`) VALUES
(1, 'admin', 'admin@playsouthend.co.uk', '59c272a3eb920b5113d4b15c0b67b825', 1, NULL, '', '0000-00-00 00:00:00', 0, 2, 0);

--
-- Default data for table `media`
--
INSERT INTO `media` (`id`, `name`, `path`, `creator`, `tags`, `type`, `thumbnail`, `created`, `flagged`) VALUES
(1, '', 'uploads/defaults/beach.png', 1, '', 'background', 'uploads/defaults/thumbnailbeach.png', '0000-00-00 00:00:00', 0),
(2, 'Alien 1', 'uploads/defaults/alien01.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(3, 'Alien 2', 'uploads/defaults/alien02.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(4, 'Alien 3', 'uploads/defaults/alien03.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(5, 'Alien 4', 'uploads/defaults/alien04.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(6, 'Ball 1', 'uploads/defaults/ball1.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(7, 'Ball 2', 'uploads/defaults/ball2.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(8, 'Ball 3', 'uploads/defaults/ball3.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(9, 'Ball 4', 'uploads/defaults/ball4.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(10, 'Fish 1', 'uploads/defaults/fish1.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(11, 'Fish 2', 'uploads/defaults/fish2.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(12, 'Fish 3', 'uploads/defaults/fish3.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(13, 'Fish 4', 'uploads/defaults/fish4.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(14, 'Fish 5', 'uploads/defaults/fish5.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(15, 'Fish 6', 'uploads/defaults/fish6.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(16, 'Pickup 1', 'uploads/defaults/pickup1.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(17, 'Pickup 2', 'uploads/defaults/pickup2.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(18, 'Pickup 3', 'uploads/defaults/pickup3.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(19, 'Pickup 4', 'uploads/defaults/pickup4.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(20, 'Icecream', 'uploads/defaults/icecream01.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0),
(21, 'Dr Crab', 'uploads/defaults/drcrab.png', 1, '', 'object', '', '0000-00-00 00:00:00', 0);

--
-- Default data for table `audio`
--

INSERT INTO `audio` VALUES
(1, 'music', 'Muffled music', 'audio/1375345362Muffled music 1.mp3', 'audio/1375345362Muffled music 1.ogg'),
(2, 'effect', 'Little roar', 'audio/1368198130Effect1.mp3', 'audio/1368198130Effect1.ogg'),
(3, 'effect', 'Uergh!', 'audio/1368198158Effect2.mp3', 'audio/1368198158Effect2.ogg'),
(4, 'effect', 'Pling', 'audio/1368198187Effect3.mp3', 'audio/1368198187Effect3.ogg'),
(5, 'effect', 'Arghh!', 'audio/1368198208Effect4.mp3', 'audio/1368198208Effect4.ogg'),
(6, 'effect', 'Uh', 'audio/1368198232Effect5.mp3', 'audio/1368198232Effect5.ogg'),
(7, 'effect', 'Jeer at losers', 'audio/1368198314Loose1.mp3', 'audio/1368198314Loose1.ogg'),
(8, 'effect', 'Applaud winners', 'audio/1368198355Win1.mp3', 'audio/1368198355Win1.ogg'),
(9, 'effect', 'Magical arrival', 'audio/1368198397Effect6.mp3', 'audio/1368198397Effect6.ogg'),
(12, 'effect', 'Civic Centre Bells', 'audio/1371682278Civic Centre Bells.mp3', 'audio/1371682278Civic Centre Bells.ogg'),
(11, 'music', 'Chalkwell cinder path with halyards', 'audio/1375345840Chalkwell cinder path with halyards.mp3', 'audio/1375345840Chalkwell cinder path with halyards.ogg'),
(13, 'effect', 'Classic (female)', 'audio/1371719914Classic female.mp3', 'audio/1371719914Classic female.ogg'),
(14, 'effect', 'Nice one bruv (female)', 'audio/1371719960Nice one bruv female.mp3', 'audio/1371719960Nice one bruv female.ogg'),
(15, 'effect', 'Nice one geeza (male)', 'audio/1371719999Nice one geeza male.mp3', 'audio/1371719999Nice one geeza male.ogg'),
(16, 'effect', 'Park in palace lift', 'audio/1371720075Park in palace lift.mp3', 'audio/1371720075Park in palace lift.ogg'),
(17, 'effect', 'Proper ( female )', 'audio/1371720112Proper  female .mp3', 'audio/1371720112Proper  female .ogg'),
(18, 'effect', 'Town criers bell long', 'audio/1371720201Town criers bell long.mp3', 'audio/1371720201Town criers bell long.ogg'),
(19, 'effect', 'Cliff lift bell', 'audio/1371720383Cliff lift bell.mp3', 'audio/1371720383Cliff lift bell.ogg'),
(20, 'effect', 'Got a problem ( male )', 'audio/1371720417Got a problem  male .mp3', 'audio/1371720417Got a problem  male .ogg'),
(21, 'effect', 'I dont think so ( female )', 'audio/1371720602I dont think so  female .mp3', 'audio/1371720602I dont think so  female .ogg'),
(22, 'effect', 'I dont think so ( male)', 'audio/1371720627I dont think so  male.mp3', 'audio/1371720627I dont think so  male.ogg'),
(23, 'effect', 'Lanyard', 'audio/1371720652Lanyard.mp3', 'audio/1371720652Lanyard.ogg'),
(24, 'effect', 'Nah 2 ( female )', 'audio/1371720691Nah 2  female .mp3', 'audio/1371720691Nah 2  female .ogg'),
(25, 'effect', 'Sort it aht ( gamer )', 'audio/1371720726Sort it aht  gamer .mp3', 'audio/1371720726Sort it aht  gamer .ogg'),
(26, 'effect', 'Unlucky ( gamer )', 'audio/1371720759Unlucky  gamer .mp3', 'audio/1371720759Unlucky  gamer .ogg'),
(27, 'effect', 'Unlucky 1 ( female )', 'audio/1371721218Unlucky 1  female .mp3', 'audio/1371721218Unlucky 1  female .ogg'),
(28, 'effect', 'Unlucky 2 ( female )', 'audio/1371721243Unlucky 2  female .mp3', 'audio/1371721243Unlucky 2  female .ogg'),
(29, 'effect', 'Unlucky bruv ( male)', 'audio/1371721289Unlucky bruv  male.mp3', 'audio/1371721289Unlucky bruv  male.ogg'),
(30, 'effect', 'Whatever ( gamer )', 'audio/1371721328Whatever  gamer .mp3', 'audio/1371721328Whatever  gamer .ogg'),
(31, 'effect', 'Bottle 1', 'audio/1371723887Bottle 1.mp3', 'audio/1371723887Bottle 1.ogg'),
(32, 'effect', 'Mug   Bottle', 'audio/1371723930Mug   Bottle.mp3', 'audio/1371723930Mug   Bottle.ogg'),
(33, 'effect', 'Mug', 'audio/1371723951Mug.mp3', 'audio/1371723951Mug.ogg'),
(34, 'effect', 'Mug 2', 'audio/1371724031Mug 2.mp3', 'audio/1371724031Mug 2.ogg'),
(35, 'effect', 'Mug 4', 'audio/1371724056Mug 4.mp3', 'audio/1371724056Mug 4.ogg'),
(36, 'effect', 'Mug 4', 'audio/1371724074Mug 4.mp3', 'audio/1371724074Mug 4.ogg'),
(37, 'effect', 'Nice one mate (gamer)', 'audio/1371724109Nice one mate gamer.mp3', 'audio/1371724109Nice one mate gamer.ogg'),
(38, 'effect', 'Safe', 'audio/1371724136Safe.mp3', 'audio/1371724136Safe.ogg'),
(39, 'effect', 'Sick (gamer)', 'audio/1371724166Sick gamer.mp3', 'audio/1371724166Sick gamer.ogg'),
(40, 'effect', 'Yeah ave it (female)', 'audio/1371724201Yeah ave it female.mp3', 'audio/1371724201Yeah ave it female.ogg'),
(41, 'effect', 'Yeah mate (female)', 'audio/1371724239Yeah mate female.mp3', 'audio/1371724239Yeah mate female.ogg'),
(42, 'effect', 'Queensway Ambulance', 'audio/1371724357Queensway Ambulance.mp3', 'audio/1371724357Queensway Ambulance.ogg'),
(43, 'effect', 'Chatter 2', 'audio/1371725335Chatter 2.mp3', 'audio/1371725335Chatter 2.ogg'),
(44, 'effect', 'Muffled music 1', 'audio/1371725455Muffled music 1.mp3', 'audio/1371725455Muffled music 1.ogg'),
(45, 'effect', 'Muffled music 2', 'audio/1371725553Muffled music 2.mp3', 'audio/1371725553Muffled music 2.ogg'),
(46, 'effect', 'Innit ( gamers )', 'audio/1371727008Innit  gamers .mp3', 'audio/1371727008Innit  gamers .ogg'),
(47, 'effect', 'Oh my days( gamers )', 'audio/1371727037Oh my days gamers .mp3', 'audio/1371727037Oh my days gamers .ogg'),
(48, 'effect', 'Awright babe (female)', 'audio/1371727083Awright babe female.mp3', 'audio/1371727083Awright babe female.ogg'),
(49, 'effect', 'Awright babe 2 (female)', 'audio/1371727113Awright babe 2 female.mp3', 'audio/1371727113Awright babe 2 female.ogg'),
(50, 'effect', 'Awright mate 2 (female)', 'audio/1371727140Awright mate 2 female.mp3', 'audio/1371727140Awright mate 2 female.ogg'),
(51, 'effect', 'Awright mate (female)', 'audio/1371727186Awright mate female.mp3', 'audio/1371727186Awright mate female.ogg'),
(52, 'effect', 'Innit (female)', 'audio/1371727211Innit female.mp3', 'audio/1371727211Innit female.ogg'),
(53, 'effect', 'Sout of order (female)', 'audio/1371727303Sout of order female.mp3', 'audio/1371727303Sout of order female.ogg'),
(54, 'effect', 'Whatever 1 (female)', 'audio/1371727334Whatever 1 female.mp3', 'audio/1371727334Whatever 1 female.ogg'),
(55, 'effect', 'Yeah mate 1 (female)', 'audio/1371727376Yeah mate 1 female.mp3', 'audio/1371727376Yeah mate 1 female.ogg'),
(56, 'effect', 'Yeah mate 3 (female)', 'audio/1371727407Yeah mate 3 female.mp3', 'audio/1371727407Yeah mate 3 female.ogg'),
(57, 'effect', 'Yeah whatever (female)', 'audio/1371727443Yeah whatever female.mp3', 'audio/1371727443Yeah whatever female.ogg'),
(58, 'effect', 'Awright babe (male)', 'audio/1371727484Awright babe male.mp3', 'audio/1371727484Awright babe male.ogg'),
(59, 'effect', 'Awright mate (male)', 'audio/1371727519Awright mate male.mp3', 'audio/1371727519Awright mate male.ogg'),
(60, 'effect', 'Innit (male)', 'audio/1371727565Innit male.mp3', 'audio/1371727565Innit male.ogg'),
(61, 'effect', 'Nah (male)', 'audio/1371727588Nah male.mp3', 'audio/1371727588Nah male.ogg'),
(62, 'effect', 'Proper (male)', 'audio/1371727610Proper male.mp3', 'audio/1371727610Proper male.ogg'),
(63, 'effect', 'Gentle Sea 1', 'audio/1371727867Gentle Sea 1.mp3', 'audio/1371727867Gentle Sea 1.ogg'),
(64, 'effect', 'Gentle Sea 2', 'audio/1371728116Gentle Sea 2.mp3', 'audio/1371728116Gentle Sea 2.ogg'),
(65, 'effect', 'Distant sea gull and dove', 'audio/1371728348Distant sea gull and dove.mp3', 'audio/1371728348Distant sea gull and dove.ogg'),
(66, 'effect', 'seagull b1', 'audio/1371728567seagull b1.mp3', 'audio/1371728567seagull b1.ogg'),
(67, 'effect', 'seagull b2', 'audio/1371728594seagull b2.mp3', 'audio/1371728594seagull b2.ogg'),
(68, 'effect', 'seagull b3', 'audio/1371728639seagull b3.mp3', 'audio/1371728639seagull b3.ogg'),
(69, 'effect', 'seagull b4', 'audio/1371728682seagull b4.mp3', 'audio/1371728682seagull b4.ogg'),
(70, 'effect', 'Birds long 1', 'audio/1371728840Birds long 1.mp3', 'audio/1371728840Birds long 1.ogg'),
(71, 'effect', 'Birds long 2', 'audio/1371729083Birds long 2.mp3', 'audio/1371729083Birds long 2.ogg'),
(72, 'effect', 'Blackbird 1', 'audio/1371729407Blackbird 1.mp3', 'audio/1371729407Blackbird 1.ogg'),
(73, 'effect', 'Crow 1', 'audio/1371729531Crow 1.mp3', 'audio/1371729531Crow 1.ogg'),
(74, 'effect', 'Crow 2', 'audio/1371729623Crow 2.mp3', 'audio/1371729623Crow 2.ogg'),
(75, 'effect', 'Doves 1', 'audio/1371729664Doves 1.mp3', 'audio/1371729664Doves 1.ogg'),
(76, 'effect', 'Doves 2', 'audio/1371729700Doves 2.mp3', 'audio/1371729700Doves 2.ogg'),
(77, 'effect', 'Doves 3', 'audio/1371729802Doves 3.mp3', 'audio/1371729802Doves 3.ogg'),
(78, 'effect', 'Pigeon 1', 'audio/1371729970Pigeon 1.mp3', 'audio/1371729970Pigeon 1.ogg'),
(79, 'effect', 'Pigeon 2', 'audio/1371730185Pigeon 2.mp3', 'audio/1371730185Pigeon 2.ogg'),
(80, 'effect', 'Pigeon 3', 'audio/1371730720Pigeon 3.mp3', 'audio/1371730720Pigeon 3.ogg'),
(81, 'effect', 'Pigeon 4', 'audio/1371730790Pigeon 4.mp3', 'audio/1371730790Pigeon 4.ogg'),
(82, 'effect', 'Car 1', 'audio/1371731021Car 1.mp3', 'audio/1371731021Car 1.ogg'),
(83, 'effect', 'Car 2', 'audio/1371731139Car 2.mp3', 'audio/1371731139Car 2.ogg'),
(84, 'effect', 'Car 3', 'audio/1371731184Car 2.mp3', 'audio/1371731184Car 2.ogg'),
(85, 'effect', 'Car passing long', 'audio/1371731722Car passing long.mp3', 'audio/1371731722Car passing long.ogg'),
(86, 'effect', 'Car passing short', 'audio/1371731801Car passing short.mp3', 'audio/1371731801Car passing short.ogg'),
(87, 'effect', 'Van 1', 'audio/1371731951Van 1.mp3', 'audio/1371731951Van 1.ogg'),
(88, 'music', 'PYP Technomix', 'audio/1372089391Endell3 Technomix.mp3', 'audio/1372089391Endell3 Technomix.ogg'),
(89, 'music', 'PYP Rocks', 'audio/1372089610Endell Street 3.mp3', 'audio/1372089610Endell Street 3.ogg'),
(90, 'music', 'PYP Magical', 'audio/1372089758In the Whoosh Garden.mp3', 'audio/1372089758In the Whoosh Garden.ogg'),
(91, 'music', 'PYP Ambient', 'audio/1372090089Whoosh 2 FF.mp3', 'audio/1372090089Whoosh 2 FF.ogg'),
(92, 'effect', 'Muffled music 1', 'audio/1375345362Muffled music 1.mp3', 'audio/1375345362Muffled music 1.ogg'),
(93, 'effect', 'Chalkwell cinder path with halyards', 'audio/1375345840Chalkwell cinder path with halyards.mp3', 'audio/1375345840Chalkwell cinder path with halyards.ogg'),
(94, 'effect', 'Birds and c2c s', 'audio/1375346133Birds and c2c s.mp3', 'audio/1375346133Birds and c2c s.ogg'),
(95, 'effect', 'Chatter', 'audio/1375346186Chatter.mp3', 'audio/1375346186Chatter.ogg'),
(96, 'effect', 'Chatter 2', 'audio/1375346242Chatter 2.mp3', 'audio/1375346242Chatter 2.ogg'),
(97, 'effect', 'Gentle Sea 1s', 'audio/1375346291Gentle Sea 1s.mp3', 'audio/1375346291Gentle Sea 1s.ogg'),
(98, 'music', 'Gentle Sea 1s', 'audio/1375346318Gentle Sea 1s.mp3', 'audio/1375346318Gentle Sea 1s.ogg'),
(99, 'music', 'Gentle Sea 2s', 'audio/1375346383Gentle Sea 1s.mp3', 'audio/1375346383Gentle Sea 1s.ogg'),
(100, 'effect', 'Gentle Sea 2s', 'audio/1375346429Gentle Sea 1s.mp3', 'audio/1375346429Gentle Sea 1s.ogg'),
(101, 'music', 'High Street 1', 'audio/1375346488High Street 1.mp3', 'audio/1375346488High Street 1.ogg'),
(102, 'effect', 'High Street 1', 'audio/1375346562High Street 1.mp3', 'audio/1375346562High Street 1.ogg'),
(103, 'music', 'Muffled music 2', 'audio/1375346685Muffled music 2.mp3', 'audio/1375346685Muffled music 2.ogg'),
(104, 'effect', 'Muffled music 2', 'audio/1375346737Muffled music 2.mp3', 'audio/1375346737Muffled music 2.ogg'),
(105, 'effect', 'Pigeon 1', 'audio/1375346815Pigeon 1.mp3', 'audio/1375346815Pigeon 1.ogg'),
(106, 'effect', 'Pigeon 2', 'audio/1375346920Pigeon 2.mp3', 'audio/1375346920Pigeon 2.ogg'),
(110, 'effect', 'Priory Park bowls 1', 'audio/1375347247Priory Park bowls 1.mp3', 'audio/1375347247Priory Park bowls 1.ogg'),
(108, 'music', 'Pigeon 2', 'audio/1375347034Pigeon 2.mp3', 'audio/1375347034Pigeon 2.ogg'),
(109, 'music', 'Priory Park bowls 1', 'audio/1375347208Priory Park bowls 1.mp3', 'audio/1375347208Priory Park bowls 1.ogg'),
(111, 'effect', 'Queensway Ambulance 1', 'audio/1375347369Queensway Ambulance 1.mp3', 'audio/1375347369Queensway Ambulance 1.ogg'),
(112, 'music', 'Queensway Ambulance 1', 'audio/1375347392Queensway Ambulance 1.mp3', 'audio/1375347392Queensway Ambulance 1.ogg'),
(113, 'effect', 'Queensway Ambulance 1', 'audio/1375347845Queensway Ambulance 1.mp3', 'audio/1375347845Queensway Ambulance 1.ogg'),
(114, 'music', 'Queensway Ambulance 1', 'audio/1375347971Queensway Ambulance 1.mp3', 'audio/1375347971Queensway Ambulance 1.ogg'),
(115, 'effect', 'Seagull b1', 'audio/1375348010Seagull 1.mp3', 'audio/1375348010Seagull 1.ogg'),
(116, 'effect', 'Seagull b2', 'audio/1375348051Seagull b2.mp3', 'audio/1375348051Seagull b2.ogg'),
(117, 'effect', 'Seagull b3', 'audio/1375348110Seagull b3.mp3', 'audio/1375348110Seagull b3.ogg'),
(118, 'effect', 'Seagull b4', 'audio/1375348141Seagull b4.mp3', 'audio/1375348141Seagull b4.ogg'),
(119, 'music', 'Travel Centre', 'audio/1375348224Travel Centre.mp3', 'audio/1375348224Travel Centre.ogg'),
(120, 'effect', 'Travel Centre', 'audio/1375348271Travel Centre.mp3', 'audio/1375348271Travel Centre.ogg'),
(121, 'music', 'Victoria Plaza', 'audio/1375348375Victoria Plaza.mp3', 'audio/1375348375Victoria Plaza.ogg'),
(122, 'music', 'PYP Dubstep', 'audio/1377688173PYP Dubstep.mp3', 'audio/1377688173PYP Dubstep.ogg');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
