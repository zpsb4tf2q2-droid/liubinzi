# Deployment Guide

This guide will walk you through deploying your Next.js + Supabase application to Vercel.

## Prerequisites

Before deploying, ensure you have:

- A [Vercel account](https://vercel.com/signup) (free tier available)
- A [Supabase account](https://supabase.com) with a project created
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Required Environment Variables

The following environment variables must be configured in your production environment:

### Public Variables (accessible in browser)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

### Private Variables (server-side only)
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (admin access)

⚠️ **Security Note**: Never commit these values to your repository. The service role key should only be used server-side as it has full admin access to your database.

## Step 1: Prepare Your Supabase Project

1. **Create a Supabase Project** (if you haven't already)
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Click "New Project"
   - Choose your organization, enter project name, database password, and region
   - Wait 1-2 minutes for setup to complete

2. **Get Your Supabase Credentials**
   - Navigate to **Settings** → **API** in your Supabase dashboard
   - Copy the following values:
     - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
     - **anon public** key (under "Project API keys")
     - **service_role** key (under "Project API keys")

3. **Enable Authentication** (if using auth features)
   - Go to **Authentication** → **Providers**
   - Enable "Email" provider or other providers as needed
   - Configure email templates under **Authentication** → **Email Templates**

4. **Set Up Your Database Schema**
   - Use the Supabase SQL editor or migrations to create your tables
   - Configure Row Level Security (RLS) policies for data protection
   - Run any seed data scripts

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Import Your Repository**
   - Go to [https://vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Connect your Git provider and select your repository

2. **Configure Project Settings**
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: Leave as `./` unless your project is in a subdirectory
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

3. **Add Environment Variables**
   - In the "Environment Variables" section, add:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
     ```
   - Make sure to add these for **Production**, **Preview**, and **Development** environments

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # For preview deployment
   vercel
   
   # For production deployment
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   ```

## Step 3: Configure Vercel Project Settings

1. **Domain Settings** (Optional)
   - Go to your project settings in Vercel
   - Navigate to **Domains**
   - Add your custom domain if you have one

2. **Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Verify all required variables are set
   - You can add different values for Preview and Development environments

3. **Build & Development Settings**
   - Ensure the following are correct:
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install`

## Step 4: Post-Deployment Configuration

### Configure Supabase Redirect URLs

After deployment, you need to add your Vercel URLs to Supabase's allowed redirect URLs:

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URLs to **Site URL** and **Redirect URLs**:
   - Production: `https://your-app.vercel.app`
   - Custom domain (if any): `https://your-domain.com`
   - Localhost (for development): `http://localhost:3000`

### Set Up Webhooks (Optional)

If your application uses Supabase webhooks:

1. Go to **Database** → **Webhooks** in Supabase
2. Create a new webhook pointing to your Vercel deployment
   - URL: `https://your-app.vercel.app/api/webhook`
   - Configure HTTP method and payload as needed
3. Add webhook secret to Vercel environment variables if using signature verification

## Step 5: Verify Deployment

1. **Visit Your Deployed Site**
   - Go to the URL provided by Vercel (e.g., `https://your-app.vercel.app`)
   - Test navigation and ensure all pages load correctly

2. **Check Console for Errors**
   - Open browser DevTools (F12)
   - Look for any console errors or warnings
   - Verify environment variables are loading correctly

3. **Test Authentication Flow** (if implemented)
   - Try signing up with a test account
   - Verify email confirmation works (check Supabase Auth logs)
   - Test sign in and sign out functionality

4. **Monitor Build Logs**
   - Check Vercel deployment logs for any build warnings or errors
   - Monitor Supabase logs for database queries and auth events

## Continuous Deployment

Vercel automatically sets up continuous deployment:

- **Production Branch**: Pushes to your main/master branch automatically deploy to production
- **Preview Deployments**: Pushes to other branches create preview deployments
- **Pull Requests**: Each PR gets its own unique preview URL

You can configure which branch triggers production deployments in Vercel's Git settings.

## Troubleshooting

### Build Fails

- Check Vercel build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify TypeScript types are correct (`npm run build` locally)
- Check that environment variables are set correctly

### Environment Variables Not Loading

- Ensure variable names match exactly (case-sensitive)
- Prefix client-side variables with `NEXT_PUBLIC_`
- Redeploy after adding/changing environment variables
- Clear build cache in Vercel if needed

### Authentication Errors

- Verify Supabase URL and keys are correct
- Check that redirect URLs are configured in Supabase
- Ensure service role key is only used server-side
- Check Supabase Auth logs for specific errors

### Database Connection Issues

- Verify Supabase project is not paused
- Check that RLS policies allow necessary operations
- Ensure database credentials are correct
- Monitor Supabase dashboard for connection errors

## Performance Optimization

1. **Enable Vercel Analytics**
   - Go to project settings → Analytics
   - Track Core Web Vitals and user experience

2. **Configure Caching**
   - Use Next.js `revalidate` for ISR (Incremental Static Regeneration)
   - Implement proper cache headers for API routes

3. **Optimize Images**
   - Use Next.js Image component
   - Configure image optimization in `next.config.js`

4. **Monitor Performance**
   - Use Vercel Speed Insights
   - Check Lighthouse scores regularly
   - Monitor Supabase query performance

## Monitoring and Maintenance

1. **Vercel Dashboard**
   - Monitor deployment status
   - Check function execution logs
   - Review analytics and performance metrics

2. **Supabase Dashboard**
   - Monitor database usage and query performance
   - Check auth logs for failed login attempts
   - Review API usage and rate limits

3. **Set Up Alerts**
   - Configure Vercel deployment notifications
   - Set up Supabase monitoring alerts
   - Monitor error tracking (consider adding Sentry or similar)

## Security Checklist

- [ ] Service role key is not exposed to client
- [ ] Row Level Security (RLS) policies are configured
- [ ] CORS settings are properly configured
- [ ] Authentication redirect URLs are whitelisted
- [ ] Environment variables are set in Vercel (not in code)
- [ ] API routes have proper authentication checks
- [ ] Rate limiting is implemented for public endpoints
- [ ] Input validation is implemented on all forms
- [ ] HTTPS is enforced (handled by Vercel by default)

## Rolling Back

If you need to roll back a deployment:

1. Go to your project in Vercel dashboard
2. Navigate to **Deployments**
3. Find the previous working deployment
4. Click the three dots menu → **Promote to Production**

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js with Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## Support

For deployment issues:
- Check Vercel's status page: [https://www.vercel-status.com](https://www.vercel-status.com)
- Check Supabase status: [https://status.supabase.com](https://status.supabase.com)
- Review logs in both Vercel and Supabase dashboards
- Consult respective documentation and community forums
