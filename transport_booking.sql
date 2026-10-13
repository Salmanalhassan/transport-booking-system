-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 13, 2026 at 01:04 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `transport_booking`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `booking_reference` varchar(50) NOT NULL,
  `passenger_id` int(11) NOT NULL,
  `trip_id` int(11) NOT NULL,
  `seat_number` varchar(10) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `booking_status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `booked_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `booking_reference`, `passenger_id`, `trip_id`, `seat_number`, `amount`, `booking_status`, `payment_status`, `booked_by`, `created_at`, `updated_at`) VALUES
(2, 'TRP-1786309113987-1881', 7, 3, '11', 7000.00, 'pending', 'pending', 1, '2026-08-09 20:58:33', '2026-08-09 20:58:33'),
(4, 'TRP-1786455840718-7426', 9, 3, '3', 7000.00, 'pending', 'pending', 1, '2026-08-11 13:44:00', '2026-08-11 13:44:00'),
(6, 'TRP-1786457915125-5186', 1, 3, '4', 7000.00, 'pending', 'pending', 1, '2026-08-11 14:18:35', '2026-08-11 14:18:35'),
(7, 'TRP-1786636954130-8672', 11, 3, '1', 7000.00, 'confirmed', 'paid', 1, '2026-08-13 16:02:34', '2026-08-14 15:17:46'),
(8, 'TRP-1786753309617-6860', 11, 3, '34', 7000.00, 'confirmed', 'paid', 3, '2026-08-15 00:21:49', '2026-08-15 00:22:25'),
(9, 'TRP-1786754563116-5231', 11, 5, '1', 10000.00, 'confirmed', 'paid', 3, '2026-08-15 00:42:43', '2026-08-15 00:43:51'),
(10, 'TRP-1786755788816-8803', 12, 3, '28', 7000.00, 'confirmed', 'paid', 4, '2026-08-15 01:03:08', '2026-08-15 12:53:29'),
(11, 'TRP-1788455848725-5387', 12, 3, '5', 7000.00, 'pending', 'pending', 4, '2026-09-03 17:17:28', '2026-09-03 17:17:28'),
(12, 'TRP-1788897472004-4229', 12, 4, '7', 14000.00, 'confirmed', 'paid', 4, '2026-09-08 19:57:52', '2026-09-08 19:58:48'),
(13, 'TRP-1789424215980-3262', 11, 3, '6', 7000.00, 'pending', 'pending', 3, '2026-09-14 22:16:55', '2026-09-14 22:16:55'),
(14, 'TRP-1789466147544-3267', 12, 4, '9', 14000.00, 'pending', 'pending', 4, '2026-09-15 09:55:47', '2026-09-15 09:55:47'),
(15, 'TRP-1791831161116-9632', 12, 5, '10', 10000.00, 'pending', 'pending', 4, '2026-10-12 18:52:41', '2026-10-12 18:52:41'),
(16, 'TRP-1791837805109-6476', 12, 6, '19', 15000.00, 'pending', 'pending', 4, '2026-10-12 20:43:25', '2026-10-12 20:43:25'),
(17, 'TRP-1791838486872-8805', 12, 5, '6', 10000.00, 'pending', 'pending', 4, '2026-10-12 20:54:46', '2026-10-12 20:54:46'),
(18, 'TRP-1791839464361-2429', 12, 4, '5', 14000.00, 'pending', 'pending', 4, '2026-10-12 21:11:04', '2026-10-12 21:11:04');

-- --------------------------------------------------------

--
-- Table structure for table `buses`
--

CREATE TABLE `buses` (
  `id` int(11) NOT NULL,
  `bus_number` varchar(50) NOT NULL,
  `plate_number` varchar(50) NOT NULL,
  `bus_type` varchar(50) DEFAULT NULL,
  `total_seats` int(11) NOT NULL,
  `status` enum('available','on_trip','maintenance','inactive') DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `buses`
--

INSERT INTO `buses` (`id`, `bus_number`, `plate_number`, `bus_type`, `total_seats`, `status`, `created_at`, `updated_at`) VALUES
(1, 'BUS-001', 'KAN-123-AB', 'Luxury', 50, 'available', '2026-08-08 15:50:17', '2026-08-08 15:50:17'),
(3, 'BUS-111', 'KT1T-290', 'Mini Bus', 20, 'available', '2026-08-14 23:22:14', '2026-08-14 23:22:14');

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `license_number` varchar(100) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `status` enum('available','on_trip','inactive') DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`id`, `full_name`, `phone`, `license_number`, `address`, `status`, `created_at`, `updated_at`) VALUES
(2, 'Salman Alhassan', '09167160077', 'LIC-001', 'nafsah plaza', 'available', '2026-08-09 01:12:43', '2026-08-09 01:13:04'),
(3, 'umar sadiq', '09137060847', 'LIC-002', 'ubguwar kwari daura', 'on_trip', '2026-08-10 07:45:38', '2026-08-10 07:45:38'),
(4, 'abdurrazak ibrahim', '0912345678', 'LIC-003', 'KOFAR AREWA', 'available', '2026-10-12 20:41:11', '2026-10-12 20:41:11');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `passengers`
--

CREATE TABLE `passengers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `emergency_contact` varchar(100) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `passengers`
--

INSERT INTO `passengers` (`id`, `user_id`, `full_name`, `email`, `phone`, `address`, `emergency_contact`, `emergency_phone`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Abdullahi Musa', 'musa.updated@example.com', '08012345678', 'Kano', 'Ali Abdullahi', '08087654321', '2026-08-08 20:14:15', '2026-08-09 13:19:23'),
(2, NULL, 'Salman Alhassan muhammad', 'salmandra212@gmail.com', '09167160077', 'nafsah plaza daura', 'sahiba alhassan', '08102795636', '2026-08-08 20:45:33', '2026-08-08 21:39:25'),
(7, NULL, 'Salman Alhassan muhammad', 'salmandra212@gmail.com', '+2349167160077', NULL, NULL, NULL, '2026-08-09 20:58:33', '2026-08-11 14:16:35'),
(9, NULL, 'khadija', NULL, '07031984453', NULL, NULL, NULL, '2026-08-11 13:44:00', '2026-08-11 13:44:00'),
(10, 2, 'Test Passenger', 'testpassenger@gmail.com', '09016349473', 'Daura, Katsina', 'Test Contact', '08087654321', '2026-08-13 01:04:37', '2026-08-13 01:04:37'),
(11, 3, 'umar sadiq', 'umar@gmail.com', '09137060847', 'KOFAR AREWA', 'sadiq', '07043342184', '2026-08-13 07:38:43', '2026-08-13 07:38:43'),
(12, 4, 'usman tijjani', 'usman@gmail.com', '09068021635', 'katsina road gra', 'shagari', '09164089103', '2026-08-15 01:02:41', '2026-08-15 01:02:41'),
(14, 5, 'abdulrazak ibrahim', 'abdul@gmail.com', '09128183558', 'kankara', '09128183558', '09128183558', '2026-10-12 21:03:46', '2026-10-12 21:03:46');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','transfer','online') NOT NULL,
  `payment_status` enum('pending','successful','failed','refunded') DEFAULT 'pending',
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `booking_id`, `payment_reference`, `amount`, `payment_method`, `payment_status`, `paid_at`, `created_at`) VALUES
(1, 2, 'TRP-PAY-1786453052211-4076', 7000.00, 'online', 'failed', NULL, '2026-08-11 12:57:32'),
(2, 2, 'TRP-PAY-1786454382581-2686', 7000.00, 'online', 'failed', NULL, '2026-08-11 13:19:42'),
(3, 2, 'TRP-PAY-1786454398460-4490', 7000.00, 'online', 'failed', NULL, '2026-08-11 13:19:58'),
(4, 4, 'TRP-PAY-1786455858699-5969', 7000.00, 'online', 'failed', NULL, '2026-08-11 13:44:18'),
(5, 4, 'TRP-PAY-1786455952248-2013', 7000.00, 'online', 'failed', NULL, '2026-08-11 13:45:52'),
(6, 4, 'TRP-PAY-1786455959524-5111', 7000.00, 'online', 'failed', NULL, '2026-08-11 13:45:59'),
(7, 4, 'TRP-PAY-1786455979211-7416', 7000.00, 'online', 'failed', NULL, '2026-08-11 13:46:19'),
(8, 4, 'TRP-PAY-1786456334374-5760', 7000.00, 'online', 'failed', NULL, '2026-08-11 13:52:14'),
(9, 6, 'TRP-PAY-1786457933911-3555', 7000.00, 'online', 'pending', NULL, '2026-08-11 14:18:53'),
(10, 6, 'TRP-PAY-1786458677562-6505', 7000.00, 'online', 'pending', NULL, '2026-08-11 14:31:17'),
(11, 6, 'TRP-PAY-1786458701478-2216', 7000.00, 'online', 'pending', NULL, '2026-08-11 14:31:41'),
(12, 6, 'TRP-PAY-1786458781698-4592', 7000.00, 'online', 'pending', NULL, '2026-08-11 14:33:01'),
(13, 6, 'TRP-PAY-1786459296168-7146', 7000.00, 'online', 'pending', NULL, '2026-08-11 14:41:36'),
(14, 2, 'TRP-PAY-1786459350194-4312', 7000.00, 'online', 'pending', NULL, '2026-08-11 14:42:30'),
(15, 6, 'TRP-PAY-1786482773229-5495', 7000.00, 'online', 'pending', NULL, '2026-08-11 21:12:53'),
(16, 6, 'TRP-PAY-1786482785001-3054', 7000.00, 'online', 'pending', NULL, '2026-08-11 21:13:05'),
(17, 6, 'TRP-PAY-1786482841723-5857', 7000.00, 'online', 'pending', NULL, '2026-08-11 21:14:01'),
(18, 7, 'TRP-PAY-1786718690102-5671', 7000.00, 'online', 'pending', NULL, '2026-08-14 14:44:50'),
(19, 7, 'TRP-PAY-1786719690646-9878', 7000.00, 'online', 'pending', NULL, '2026-08-14 15:01:30'),
(20, 7, 'TRP-PAY-1786720615580-7967', 7000.00, 'online', 'successful', '2026-08-14 15:17:46', '2026-08-14 15:16:55'),
(21, 8, 'TRP-PAY-1786753329302-9393', 7000.00, 'online', 'successful', '2026-08-15 00:22:25', '2026-08-15 00:22:09'),
(22, 9, 'TRP-PAY-1786754584868-3218', 10000.00, 'online', 'successful', '2026-08-15 00:43:51', '2026-08-15 00:43:04'),
(23, 10, 'TRP-PAY-1786788429544-4633', 7000.00, 'online', 'pending', NULL, '2026-08-15 10:07:09'),
(24, 10, 'TRP-PAY-1786790148360-9337', 7000.00, 'online', 'pending', NULL, '2026-08-15 10:35:48'),
(25, 10, 'TRP-PAY-1786792891050-8855', 7000.00, 'online', 'pending', NULL, '2026-08-15 11:21:31'),
(26, 10, 'TRP-PAY-1786793418586-6715', 7000.00, 'online', 'pending', NULL, '2026-08-15 11:30:18'),
(27, 10, 'TRP-PAY-1786798335560-4085', 7000.00, 'online', 'successful', '2026-08-15 12:53:29', '2026-08-15 12:52:15'),
(28, 12, 'TRP-PAY-1788897482527-7642', 14000.00, 'online', 'pending', NULL, '2026-09-08 19:58:02'),
(29, 12, 'TRP-PAY-1788897504189-8287', 14000.00, 'online', 'successful', '2026-09-08 19:58:48', '2026-09-08 19:58:24'),
(30, 13, 'TRP-PAY-1789424229361-9891', 7000.00, 'online', 'pending', NULL, '2026-09-14 22:17:09'),
(31, 13, 'TRP-PAY-1789424379674-5828', 7000.00, 'online', 'pending', NULL, '2026-09-14 22:19:39'),
(32, 14, 'TRP-PAY-1789466178991-8025', 14000.00, 'online', 'pending', NULL, '2026-09-15 09:56:18'),
(33, 15, 'TRP-PAY-1791831192481-5338', 10000.00, 'online', 'pending', NULL, '2026-10-12 18:53:12'),
(34, 16, 'TRP-PAY-1791837823227-2212', 15000.00, 'online', 'pending', NULL, '2026-10-12 20:43:43'),
(35, 17, 'TRP-PAY-1791838502220-2600', 10000.00, 'online', 'pending', NULL, '2026-10-12 20:55:02');

-- --------------------------------------------------------

--
-- Table structure for table `routes`
--

CREATE TABLE `routes` (
  `id` int(11) NOT NULL,
  `origin` varchar(100) NOT NULL,
  `destination` varchar(100) NOT NULL,
  `distance_km` decimal(10,2) DEFAULT NULL,
  `estimated_duration` varchar(50) DEFAULT NULL,
  `fare` decimal(10,2) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `routes`
--

INSERT INTO `routes` (`id`, `origin`, `destination`, `distance_km`, `estimated_duration`, `fare`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Kano', 'Abuja', 450.00, '6 hours', 5000.00, 'active', '2026-08-08 22:23:13', '2026-08-08 22:23:13'),
(2, 'Katsina', 'Abuja', 600.00, '8 hours 15 minutes', 1500.00, 'active', '2026-08-08 22:25:44', '2026-08-08 23:43:15'),
(4, 'DAURA', 'LAGOS', 500.00, '10 HOURS', 15000.00, 'active', '2026-08-15 00:26:47', '2026-08-15 00:26:47'),
(5, 'DAURA', 'kaduna', 390.00, '10 HOURS', 15000.00, 'active', '2026-10-12 20:37:51', '2026-10-12 20:37:51'),
(6, 'daura', 'katsina', 84.00, '1', 2000.00, 'active', '2026-10-12 21:11:53', '2026-10-12 21:11:53');

-- --------------------------------------------------------

--
-- Table structure for table `trips`
--

CREATE TABLE `trips` (
  `id` int(11) NOT NULL,
  `route_id` int(11) NOT NULL,
  `bus_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `departure_date` date NOT NULL,
  `departure_time` time NOT NULL,
  `arrival_time` time DEFAULT NULL,
  `fare` decimal(10,2) NOT NULL,
  `available_seats` int(11) NOT NULL,
  `status` enum('scheduled','boarding','departed','completed','cancelled') DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trips`
--

INSERT INTO `trips` (`id`, `route_id`, `bus_id`, `driver_id`, `departure_date`, `departure_time`, `arrival_time`, `fare`, `available_seats`, `status`, `created_at`, `updated_at`) VALUES
(3, 1, 1, 2, '2026-08-09', '07:30:00', '17:40:00', 7000.00, 31, 'scheduled', '2026-08-09 11:53:43', '2026-09-14 22:16:56'),
(4, 2, 3, 3, '2026-06-14', '06:30:00', '18:25:00', 14000.00, 7, 'scheduled', '2026-08-14 23:24:05', '2026-10-12 21:11:04'),
(5, 4, 3, 3, '2026-09-16', '19:30:00', '20:33:00', 10000.00, 17, 'scheduled', '2026-08-15 00:29:44', '2026-10-12 20:54:46'),
(6, 5, 3, 3, '2026-10-13', '07:40:00', '12:39:00', 15000.00, 19, 'scheduled', '2026-10-12 20:40:12', '2026-10-12 20:43:25'),
(7, 6, 3, 4, '2026-09-29', '12:20:00', '11:20:00', 2000.00, 20, 'scheduled', '2026-10-12 21:19:20', '2026-10-12 21:19:20');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','passenger') DEFAULT 'staff',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `password`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'System Administrator', 'admin@transport.com', '08000000000', '$2b$12$H4t8xwccLJ6JVAqLBUMoGOGGcErLtY3T0Dz78Njf7X/Np7dpKfGKG', 'admin', 'active', '2026-08-08 13:53:12', '2026-08-08 13:53:12'),
(2, 'Test Passenger', 'testpassenger@gmail.com', '09016349473', '$2b$12$adEfVrDCLU4cpSx7OeGPG.Hz3j07dOYNkK7n/FdhjoYIWH3GFQWWi', 'passenger', 'active', '2026-08-13 01:04:37', '2026-08-13 01:04:37'),
(3, 'umar sadiq', 'umar@gmail.com', '09137060847', '$2b$12$oC1g/3RYmd//KszhRqSvgOTlMiR2FLkhnb21Wu7NgICJjldDFX9/O', 'passenger', 'active', '2026-08-13 07:38:43', '2026-08-13 07:38:43'),
(4, 'usman tijjani', 'usman@gmail.com', '09068021635', '$2b$12$mF39bFUlWlQ7zmJwXpY1r.7XeTscaAakfBN/AsAPXghrzQFCO7I3i', 'passenger', 'active', '2026-08-15 01:02:41', '2026-08-15 01:02:41'),
(5, 'abdulrazak ibrahim', 'abdul@gmail.com', '09128183558', '$2b$12$jBXH6XvrgF2K4F1K7cbSBu610I/sxrGfASPK/xS6S6qr3ARlbTPQG', 'passenger', 'active', '2026-10-12 21:03:46', '2026-10-12 21:03:46');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_reference` (`booking_reference`),
  ADD KEY `passenger_id` (`passenger_id`),
  ADD KEY `trip_id` (`trip_id`),
  ADD KEY `booked_by` (`booked_by`);

--
-- Indexes for table `buses`
--
ALTER TABLE `buses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bus_number` (`bus_number`),
  ADD UNIQUE KEY `plate_number` (`plate_number`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `license_number` (`license_number`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `passengers`
--
ALTER TABLE `passengers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_reference` (`payment_reference`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `routes`
--
ALTER TABLE `routes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `trips`
--
ALTER TABLE `trips`
  ADD PRIMARY KEY (`id`),
  ADD KEY `route_id` (`route_id`),
  ADD KEY `bus_id` (`bus_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `buses`
--
ALTER TABLE `buses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `passengers`
--
ALTER TABLE `passengers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `routes`
--
ALTER TABLE `routes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `trips`
--
ALTER TABLE `trips`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`passenger_id`) REFERENCES `passengers` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`booked_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `passengers`
--
ALTER TABLE `passengers`
  ADD CONSTRAINT `fk_passengers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `trips`
--
ALTER TABLE `trips`
  ADD CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `trips_ibfk_2` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `trips_ibfk_3` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
