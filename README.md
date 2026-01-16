# Depth Map Effect | Creative Development Secrets #1

Interactive 3D depth effect using depth maps and WebGL shaders. This project was created for the YouTube video **"Depth Map | Creative Development Secrets #1"**.



https://github.com/user-attachments/assets/5c886c80-d8eb-4d53-8dd9-d7f4512c5876



## What is this effect?

The **Depth Map Effect** creates an illusion of 3D depth on a 2D image by using a grayscale depth map. The depth map contains information about how "far" or "close" each pixel is from the viewer:

- **White areas** = closer to the viewer (foreground)
- **Black areas** = farther from the viewer (background)

When the mouse moves, the shader displaces pixels based on their depth value, creating a parallax effect that makes the image appear to have real depth. Combined with smooth plane movement, it creates an immersive pseudo-3D experience.

### How it works

1. **Base Image**: The original photograph or artwork
2. **Depth Map**: A grayscale image where brightness indicates depth
3. **WebGL Shader**: Reads the depth map and displaces UV coordinates based on mouse position
4. **Smoothing & Momentum**: Lerp interpolation creates fluid, natural movement

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

Open [http://localhost:3000](http://localhost:3000) to see the effect.

## Tech Stack

- **Next.js 16** - React framework
- **React Three Fiber** - React renderer for Three.js
- **Three.js** - WebGL library
- **Leva** - GUI controls for real-time parameter tweaking
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Controls (Leva Panel)

| Control           | Description                               |
| ----------------- | ----------------------------------------- |
| **Select Image**  | Switch between available images           |
| **Amount**        | Intensity of the depth displacement       |
| **Pivot**         | Front/Back - determines which layer moves |
| **Range Min/Max** | Depth range that gets affected            |
| **Smoothing**     | Mouse movement interpolation speed        |

## Creating Your Own Depth Maps

You can generate depth maps using:

- **AI tools**: Depth Anything, MiDaS, or similar models
- **UnicornStudio**: Generate Depth Map option

---

## Author

**Christian Ortiz** - Creative Developer

### Connect with me

- **Portfolio**: [cortiz.dev](https://cortiz.dev/)
- **YouTube**: [@cortizdev](https://www.youtube.com/@cortizdev)
- **X (Twitter)**: [@cortiz2894](https://x.com/cortiz2894)
- **LinkedIn**: [Christian Daniel Ortiz](https://www.linkedin.com/in/christian-daniel-ortiz-ororbia-95b14210b/)

### Contact

For inquiries, collaborations or questions: **cortiz2894@gmail.com**

---

If you found this useful, consider subscribing to my YouTube channel for more creative development content!
