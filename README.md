# Dayspring-Frontend
This repository contains all frontend code for the Dayspring Chapel Management application, including user interfaces for interacting with the backend

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
