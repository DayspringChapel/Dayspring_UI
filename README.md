# Dayspring-Frontend
This repository contains all frontend code for the Dayspring Chapel Management application, including user interfaces for interacting with the backend

## S3 deployment

The UI in `dayspring-chapel-nextjs` is now configured for static export so it can be hosted from an S3 bucket.

### Required frontend environment variable

Set this at build time:

- `NEXT_PUBLIC_BACKEND_API_URL`: public base URL of the backend API, for example `https://dayspring-backend-4ar8.onrender.com`

### GitHub Actions deployment

This repository includes a GitHub Actions workflow at `.github/workflows/s3-deploy.yml` that builds the static site from `dayspring-chapel-nextjs/out` and syncs it to S3.

Add these GitHub repository secrets before enabling the pipeline:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `NEXT_PUBLIC_BACKEND_API_URL`
- `CLOUDFRONT_DISTRIBUTION_ID` optional, if you want automatic cache invalidation

### Bucket setup

- Enable static website hosting on the S3 bucket
- Set the index document to `index.html`
- Set the error document to `index.html`
- Allow public read access for the site, or place CloudFront in front of the bucket

### Important backend requirement

Because the UI now calls the backend directly from the browser, the backend must allow CORS from your frontend origin, for example:

- `http://<bucket-website-endpoint>`
- `https://<your-cloudfront-domain>`
- `https://<your-custom-domain>`

## GitHub Actions deployment

This repository includes a GitHub Actions workflow at `.github/workflows/ec2-deploy.yml` that builds the Next.js standalone output from `dayspring-chapel-nextjs` and deploys it to an EC2 instance over SSH.

Add these GitHub repository secrets before enabling the pipeline:

- `EC2_HOST`: public IP or DNS name of the EC2 instance
- `EC2_USER`: SSH username for the instance
- `EC2_SSH_KEY`: private key contents used by GitHub Actions to connect
- `EC2_DEPLOY_PATH`: absolute path on the server where the app should live, for example `/var/www/dayspring-chapel-nextjs`
- `EC2_PORT`: optional SSH port if not `22`

Server prerequisites:

- Node.js installed
- `pm2` installed globally
- A reverse proxy such as Nginx pointing to port `3000`
- Application environment variables configured on the EC2 server before starting `pm2`

The workflow runs on pushes to `main` and can also be triggered manually from GitHub Actions.
