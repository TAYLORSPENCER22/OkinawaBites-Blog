require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');

const MONGO_URI = process.env.MONGO_URI;

const posts = [
  {
    title: 'Okinawa Soba: Not What You Think',
    summary: "Mainland soba comes with a dipping sauce, but Okinawa soba is a soup all its own — and it's where rafute and tebichi shine.",
    cover: 'https://picsum.photos/seed/okinawa-soba/900/600',
    content: `<p>If you've had soba anywhere else in Japan, forget what you know. Most Japanese soba is served cold with a dipping sauce, but Okinawa soba is a full soup dish — thick wheat noodles (not actually buckwheat, despite the name) in a rich pork-and-bonito broth.</p>
<p>The real move is ordering it with <strong>rafute</strong> (slow-braised pork belly, melt-in-your-mouth tender) or <strong>tebichi</strong> (braised pork feet, collagen-rich and surprisingly not intimidating once you try it). Both toppings turn a simple noodle soup into something you'll be thinking about long after you leave the island.</p>
<p>Every shop has its own broth recipe, so it's worth trying a few different spots to find your favorite.</p>`,
  },
  {
    title: 'Makishi Public Market: Pick Your Fish, Eat It Upstairs',
    summary: "A fresh fish market where you buy your seafood downstairs and have it cooked upstairs — one of the best food experiences in Okinawa.",
    cover: 'https://picsum.photos/seed/makishi-market/900/600',
    content: `<p>Makishi Public Market in Naka, Naha is one of those experiences that's hard to replicate anywhere else. Downstairs is a fresh fish and produce market — you can see exactly what you're getting. Pick something that catches your eye, and head upstairs where restaurants will cook it for you on the spot.</p>
<p>It's a great way to try local seafood you might not recognize by name, without committing to a whole restaurant meal built around it. Go with an appetite and a sense of adventure.</p>`,
  },
  {
    title: 'Convenience Store Treasures: Fami Chiki & Bento',
    summary: "Family Mart's Fami Chiki and Lipton Peach Tea were my go-to snack run. Don't sleep on convenience store bento either.",
    cover: 'https://picsum.photos/seed/conbini-snacks/900/600',
    content: `<p>This might be the thing I miss most about Okinawa: how good convenience store food is. Family Mart's <strong>Fami Chiki</strong> fried chicken paired with a <strong>Lipton Peach Tea</strong> was my regular snack run — cheap, fast, and genuinely good.</p>
<p>(My brother swears 7/11's chicken is better, so consider this an open debate you should settle yourself.)</p>
<p>Also — please, please take advantage of the bento boxes at any convenience store. It sounds like a low bar, but the quality-to-price ratio is unmatched. This is one of those "you don't know what you're missing" things about Japan.</p>`,
  },
];

mongoose.connect(MONGO_URI).then(async () => {
  const user = await User.findOne({});
  if (!user) {
    console.error('No user found in the database — register an account in the app first.');
    process.exit(1);
  }
  console.log('Using author:', user.username);

  for (const p of posts) {
    const created = await Post.create({ ...p, author: user._id });
    console.log('Created post:', created.title);
  }

  console.log('Done.');
  process.exit(0);
}).catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
