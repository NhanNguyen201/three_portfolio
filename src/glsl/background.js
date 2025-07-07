export default {
    vertex: `
        varying vec2 vUv;
        varying float vWave;


        void main() {
            vUv = uv ;
            
        

            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragment: `
        uniform sampler2D uTxt1; 

        uniform float uProgress;
        uniform float uOffset;
        varying vec2 vUv;

        vec4 toRgb (vec4 c) {
            return vec4(c[0] / 255., c[1] / 255., c[2] / 255., c[3] );
        }
        vec2 rotateUV(vec2 uv, float rotation, vec2 mid) {
            return vec2(
            cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
            cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
            );
        }
            
        float PI = 3.141618;
        float fre = 5.;

        vec2 hash( vec2 p ) {
            p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
            return -1.0 + 2.0*fract(sin(p)*43758.5453123);
        }

        float noise( vec2 p ){
            const float K1 = 0.366025404; // (sqrt(3)-1)/2;
            const float K2 = 0.211324865; // (3-sqrt(3))/6;

            vec2  i = floor( p + (p.x+p.y)*K1 );
            vec2  a = p - i + (i.x+i.y)*K2;
            float m = step(a.y,a.x); 
            vec2  o = vec2(m,1.0-m);
            vec2  b = a - o + K2;
            vec2  c = a - 1.0 + 2.0*K2;
            vec3  h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
            vec3  n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
            return dot( n, vec3(70.0) );
        }
        void main() {
            
            vec2 newUV = vec2(vUv.x, (vUv.y * 0.2 + uOffset));
            float  wave = noise(vec2(newUV.x * fre, newUV.y * fre * 5.));

            vec4 pink = toRgb(vec4(230., 47., 95., 1.));
            vec4 white = toRgb(vec4(255., 255., 255., 1.));
            vec4 texture = texture2D(uTxt1, newUV);
            float gray = texture.r * 0.21 + texture.g * 0.71 + texture.b * 0.07;
            float colorFactor = 0.9;
            vec4 grayscale = vec4(texture.rgb * (1.0 - colorFactor) + (gray * colorFactor), 1.);
            vec4 txt1 = mix(texture, pink, step(uProgress - 0.02, wave * 0.5 + 0.5));
            vec4 txt2 = mix(vec4(1.), grayscale, step(uProgress + 0.02, wave * 0.5 + 0.5));
          

            gl_FragColor = mix(txt1, txt2, step(uProgress, wave * 0.5 + 0.5));
			
        }
    `
}