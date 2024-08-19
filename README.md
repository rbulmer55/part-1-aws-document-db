# Getting Started with AWS DocumentDB

What We'll Cover

- What is a document database and AWS' managed offering
- How can we set one up using AWS CDK (IAC)

Then once we have an database up and running:

- How can we connect and view from a GUI; MongoDB Compass
- How can we run migrations and seed data in the database
- How can we connect to it using an AWS Lambda function

## High Level

Our example database will be an international address normalisation piece that can be consumed by our in-house engineering domain teams to capture and display addresses and convert addresses from integrated products into a company address model.

![address model high level](./docs/doc-db-high-level.png)

## Technical Architecture

### Basic

![Simple Lambda to DocDB](./docs/doc-db-1.png)

### Connecting via MongoDB Compass GUI

![Connecting via Compass GUI](./docs/doc-db-2.png)

### Running Migrations from Lambda

![Running Migrations from Lambda](./docs/doc-db-3.png)
