# OkinawaBites

A personal project I started in January 2025 during my trip to Okinawa, Japan. Originally started as a travel blog, It's turning into a shared map of local food spots — anyone can create an account, drop a pin, add a photo and a quick note, and browse other's recommendations. 

Built with the MERN stack (MongoDB, Express, React, Node.js), using Mapbox for the interactive map and location search. I built the core structure myself, and now I'm using Claude Code to finish it.

## What's working right now

- Interactive Mapbox map of Okinawa with pins for food spots
- Search-to-add-a-pin (Mapbox Geocoding), gated behind login
- Duplicate-spot detection — searching a place that's already pinned lets you endorse it or leave a comment instead of creating a new pin
- Comments on locations (edit/delete your own)
- User accounts (register/login) with JWT auth
- About page with a photo carousel
- Responsive layout for mobile and desktop

## In progress

- "Explore all bites" page (currently a placeholder)
- Recent Bites section on the homepage is running on placeholder data until it's wired up to real pins
- Older blog-style post creation/editing still exists in the code but isn't linked from the nav anymore while the app shifts toward the map-first format

## Stack

- **Client:** React (Create React App), React Router, react-map-gl / Mapbox GL JS
- **API:** Node.js, Express, Mongoose
- **Database:** MongoDB Atlas
- **Auth:** JWT + cookies

## Running locally

This is two separate apps — `api` and `client` — each with their own `.env` (see `.env_sample` in each folder).

```
cd api && yarn install && yarn start
cd client && yarn install && yarn start
```
