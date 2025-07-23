# 📰 News Screenshots Timeline

An interactive visualization of news website evolution over time, capturing screenshots from 9 major news outlets every ~15 minutes over 2+ days.

## 🌐 [View Live Demo](https://[your-username].github.io/[repository-name]/)

## 📊 Dataset Overview

- **Duration**: July 21-23, 2025
- **Frequency**: Every ~15 minutes
- **Total Timestamps**: 199
- **News Outlets**: 9 major international sites
- **Total Screenshots**: 1,791 images
- **Optimized Size**: 27.5 MB (85% reduction from original)

## 🗞️ News Sources

| Position      | Outlet          | Country | Language |
| ------------- | --------------- | ------- | -------- |
| Top Left      | Der Standard    | Austria | German   |
| Top Center    | Die Zeit        | Germany | German   |
| Top Right     | Washington Post | USA     | English  |
| Middle Left   | Die Presse      | Austria | German   |
| Middle Center | Kronen Zeitung  | Austria | German   |
| Middle Right  | Der Spiegel     | Germany | German   |
| Bottom Left   | ORF             | Austria | German   |
| Bottom Center | Le Monde        | France  | French   |
| Bottom Right  | El País         | Spain   | Spanish  |

## 🎛️ Interactive Features

### **Interactive Slider**

- Scrub through all 199 timestamps
- Keyboard navigation (←/→ arrow keys)
- Real-time grid updates
- Responsive design

### **Video Timeline**

- 39.8-second video showing progression
- Timestamp overlays
- 3×3 grid layout
- 5 FPS for smooth playback

## 🛠️ Technical Implementation

### **Image Optimization**

- **Format**: WebP for optimal compression
- **Scaling**: 30% of original size (640×480 → 192×144)
- **Quality**: 80% WebP quality
- **Placeholders**: Black frames for missing screenshots

### **File Structure**

```
├── index.html                           # Landing page
├── graphic_output/
│   ├── news_slider_desktop.html         # Interactive slider
│   ├── screenshots_web/                 # Optimized images
│   │   └── desktop/
│   │       └── [timestamp]/
│   │           └── [site]_[timestamp].webp
│   └── videos/
│       └── news_grid_desktop_*.mp4      # Generated video
├── JS/                                  # Source scripts
│   ├── create-web-optimized-images.js   # Image optimization
│   ├── create-interactive-slider.js     # Slider generator
│   └── create-video.js                  # Video generator
└── README.md
```

### **Performance Metrics**

- **Original Size**: 183.5 MB
- **Optimized Size**: 27.5 MB
- **Compression Ratio**: 85% smaller
- **Load Time**: Fast loading with WebP compression
- **Browser Support**: Modern browsers with WebP support

## 🚀 How to Use

### **View Online**

Visit the [live demo](https://[your-username].github.io/[repository-name]/) and click:

- **🎛️ Interactive Slider** - For hands-on exploration
- **🎬 Video Timeline** - For automated playback

### **Local Development**

```bash
# Clone the repository
git clone https://github.com/[your-username]/[repository-name].git
cd [repository-name]

# Serve locally (Python 3)
python -m http.server 8000

# Or with Node.js
npx serve .

# Open in browser
open http://localhost:8000
```

## 🔧 Building from Source

### **Prerequisites**

- Node.js (for scripts)
- FFmpeg (for image/video processing)

### **Generate Optimized Images**

```bash
node JS/create-web-optimized-images.js
```

### **Create Interactive Slider**

```bash
node JS/create-interactive-slider.js
```

### **Generate Video**

```bash
node JS/create-video.js
```

## 📈 Key Insights

This visualization reveals:

- **Breaking News Events**: Major stories appearing across multiple outlets
- **Editorial Differences**: How different outlets prioritize and present news
- **Design Evolution**: Changes in website layouts and visual hierarchy
- **Update Patterns**: Frequency and timing of content updates
- **Geographic Perspectives**: How the same events are covered across different countries

## 🛡️ Data Collection Ethics

- Screenshots are taken from publicly accessible websites
- No personal data or user information is captured
- Content is used for research and educational purposes
- Respects robots.txt and fair use guidelines

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

_Built with JavaScript, HTML5, CSS3, and FFmpeg. Optimized for GitHub Pages._
