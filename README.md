# Project Tactician 🎯

**Your Live TFT Strategy Companion** - A mobile-responsive web application that helps you make strategic decisions in Teamfight Tactics by analyzing your board and providing real-time recommendations.

![Project Tactician](https://img.shields.io/badge/TFT-Strategy%20Companion-purple)
![Built with React](https://img.shields.io/badge/React-19-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

## ✨ Features

### 🎮 Manual Mode (Fully Functional)
- **Interactive Board Builder**: Select champions with tap interface
- **Star Level Management**: Upgrade champions to 3-star
- **Real-Time Analysis**: Instant similarity calculation against meta comps
- **Smart Recommendations**: Get Top 3 strategic moves
- **Meta Composition Matching**: Compare your board to 5 tier-S/A compositions

### 📷 Camera Mode (Beta)
- **Live Camera Feed**: Access your phone's camera
- **Capture Interface**: Take screenshots of your TFT game
- **Future OCR Integration**: Champion detection coming soon

### 💡 Strategy Engine
- **Similarity Scoring**: 0-100% match calculation
- **Missing Units Detection**: Know exactly what to look for
- **Item Recommendations**: Build optimal items for your carries
- **Economic Advice**: Level and gold management tips

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

```bash
# Clone or download the project
cd TFT

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## 📦 Deployment to GitHub Pages

### Option 1: Deploy from Local

```bash
# Deploy to GitHub Pages
npm run deploy
```

### Option 2: Manual Deployment

1. Create a GitHub repository named `TFT`
2. Push your code to the repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/TFT.git
   git branch -M main
   git push -u origin main
   ```
3. Run deployment:
   ```bash
   npm run deploy
   ```
4. Access your app at: `https://YOUR_USERNAME.github.io/TFT/`

### GitHub Pages Configuration

The app is configured to work with GitHub Pages:
- Base URL is set to `/TFT/` in `vite.config.ts`
- Deployment uses the `gh-pages` branch
- Automatic builds via `npm run deploy`

## 🎯 How to Use

### Manual Mode

1. **Build Your Board**:
   - Browse champions by cost tier ($1-$5)
   - Tap to add champions to your board
   - Tap again to upgrade star levels (max 3★)
   - Remove by tapping upgraded champions

2. **Get Recommendations**:
   - See your best matching composition
   - View similarity percentage
   - Follow Top 3 strategic moves
   - Check missing units and items

3. **Example Workflow**:
   ```
   Add Kalista (1-cost) → Add Garen → Add Darius
   → See "Spirit Warriors" comp (45% match)
   → Recommendation: "Find 2-star Yasuo"
   ```

### Camera Mode

1. **Grant Camera Permission**:
   - Allow browser access to your camera
   - Switch between front/back camera

2. **Capture Your Game**:
   - Position phone over your TFT screen
   - Ensure good lighting (avoid glare)
   - Tap "Capture & Analyze"

3. **Tips for Best Results**:
   - Hold phone steady and parallel to screen
   - Capture during shop phase
   - Avoid screen reflections

## 📱 Mobile Optimization

### Responsive Design
- Mobile-first Tailwind CSS
- Touch-friendly tap targets
- Optimized for 320px+ screens

### Performance
- Client-side processing (no server needed)
- Lazy-loaded components
- Optimized bundle size (~51KB gzipped)

### PWA Ready
Future enhancement: Add to home screen capability

## 🛠️ Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 3
- **Camera**: react-webcam
- **Deployment**: GitHub Pages

## 📊 Data Sources

### Meta Compositions
5 pre-configured meta comps:
- Spirit Warriors (S-Tier)
- AP Carries (S-Tier)
- Draven Carry (S-Tier)
- Reroll Kog'Maw (A-Tier)
- Brawler Bruiser (A-Tier)

### Champions Database
34 champions with:
- Cost tiers (1-5)
- Trait synergies
- Optimal item recommendations

### Items Database
33+ TFT items with:
- Component combinations
- Best use cases
- Type classifications

## 🔮 Future Enhancements

### Phase 1: OCR Integration
- [ ] Tesseract.js for text detection
- [ ] Champion name recognition
- [ ] Gold/Level detection

### Phase 2: Computer Vision
- [ ] Health bar color detection
- [ ] Unit positioning analysis
- [ ] Item detection on champions

### Phase 3: Advanced Features
- [ ] Manual correction mode
- [ ] Multiple comp comparisons
- [ ] Game state history
- [ ] Export recommendations

## 🐛 Known Issues

- Camera mode requires HTTPS in production
- OCR not yet implemented (camera is visual only)
- Meta comps are example data (not current TFT set)

## 📝 Customizing Meta Comps

Edit `src/data/meta_comps.json` to update compositions:

```json
{
  "id": "your-comp-id",
  "name": "Your Comp Name",
  "tier": "S",
  "units": [
    { "name": "Champion", "cost": 4, "stars": 2, "position": "front" }
  ],
  "coreItems": [
    { "unit": "Champion", "item": "Item Name" }
  ],
  "traits": ["Trait1", "Trait2"],
  "level": 8,
  "description": "Your description"
}
```

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for learning or personal use.

## 🙏 Acknowledgments

- TFT game data structure inspired by community tier lists
- Built with guidance from GitHub Copilot
- UI design inspired by modern gaming aesthetics

## 📞 Support

Having issues? Try these steps:

1. **Build fails**: Run `npm install` to ensure dependencies are up-to-date
2. **Camera not working**: Check browser permissions and use HTTPS
3. **Recommendations not showing**: Ensure you've added at least one champion

## 🎮 Happy Climbing!

Use Project Tactician to improve your TFT gameplay and make data-driven decisions in real-time!

---

Made with 💜 for the TFT community
