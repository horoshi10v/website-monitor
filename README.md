# Website Healthcheck Monitor 🏥

This project is a simple website healthcheck monitor, composed of two parts:

- **client**: A Nuxt.js frontend providing a UI to manage and check website statuses.
- **server**: A NestJS backend handling the logic, database interactions, and email notifications.

## Features

- Add websites with specific check intervals.
- Display the current status, last checked time, and next check interval for each website.
- Manually trigger a check or update the check interval.
- Set an alert email to receive notifications if a site is down.

## Requirements

- Docker and Docker Compose installed.

## Installation

1. Clone the repository.
2. Navigate to the `monitor` directory containing `docker-compose.yml`.

## Configuration

- Update `server/.env` with:
  ```env
  EMAIL_USER=your_email@gmail.com
  EMAIL_PASS=your_password
  ```
Emails are sent from this account, so ensure you have allowed less secure apps in your [Gmail settings](https://myaccount.google.com/apppasswords).

## Run the Project
From the monitor folder, run:
```bash
docker-compose up --build
```