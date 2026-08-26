import React, { useEffect, useRef } from "react"
import * as THREE from "three"

export function CloudShader({ className = "" }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    // Soft Light Cloud Fragment Shader
    const fragmentShader = `
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      // 2D Noise
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                            0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                           -0.577350269189626,  // -1.0 + 2.0 * C.x
                            0.024390243902439); // 1.0 / 41.0
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
              + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      float fbm(vec2 p) {
        float total = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 4; i++) {
          total += snoise(p) * amp;
          p *= 2.05;
          amp *= 0.5;
        }
        return total;
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        st.x *= u_resolution.x / u_resolution.y;

        vec2 mouse = u_mouse * 0.05;
        float t = u_time * 0.08;

        // Multi-layered cloud fbm
        float q = fbm(st * 1.8 + vec2(t * 0.5, t * 0.2) + mouse);
        float r = fbm(st * 2.2 + vec2(q * 1.2, -t * 0.4));
        float cloud = fbm(st * 1.5 + r * 1.5 + vec2(t * 0.3, t * 0.1));

        // Soft pearlescent light palette (white, faint sky blue, soft rose/lavender glow)
        vec3 bgWhite = vec3(0.985, 0.988, 1.0);
        vec3 softBlue = vec3(0.91, 0.94, 0.99);
        vec3 softPurple = vec3(0.95, 0.93, 0.99);
        vec3 warmHighlight = vec3(1.0, 0.97, 0.95);

        vec3 color = mix(bgWhite, softBlue, smoothstep(-0.3, 0.6, cloud));
        color = mix(color, softPurple, smoothstep(0.2, 0.9, r));
        color = mix(color, warmHighlight, smoothstep(0.4, 1.0, q) * 0.5);

        gl_FragColor = vec4(color, 0.85);
      }
    `

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
      u_mouse: { value: new THREE.Vector2(0, 0) },
    }

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
    })

    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    let animationFrameId
    const startTime = performance.now()

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      uniforms.u_mouse.value.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      uniforms.u_mouse.value.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    }

    window.addEventListener("mousemove", onMouseMove)

    const handleResize = () => {
      if (!container) return
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height)
      uniforms.u_resolution.value.set(width, height)
    }

    window.addEventListener("resize", handleResize)

    const animate = () => {
      const elapsedTime = (performance.now() - startTime) / 1000
      uniforms.u_time.value = elapsedTime
      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("resize", handleResize)
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    />
  )
}
