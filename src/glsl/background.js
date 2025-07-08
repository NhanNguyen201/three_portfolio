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
        uniform float uTime;
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
            
            vec2 newUv = vec2(vUv.x, (vUv.y * 0.2 + uOffset));
            vec4 texture_1 = texture2D(uTxt1, newUv);

            float  progWave = noise(vec2(newUv.x * fre, newUv.y * fre * 5.));
            float aniWave = noise(vec2((newUv.x  + uTime * 2.) * fre, (newUv.y + uTime * 3.) * fre)) * 0.15;
            
            vec4 pink = toRgb(vec4(230., 47., 95., 1.));
            vec4 white = toRgb(vec4(255., 255., 255., 1.));
            vec4 dotColor = toRgb(vec4(44., 96., 222., 1.));
            float r1 = texture2D(uTxt1, fract(newUv + aniWave * 0.06)).r  ; // turn pink
            float g1 = texture2D(uTxt1, fract(newUv +  aniWave * 0.0005 )).g    ;
            float b1 = texture2D(uTxt1, fract(newUv + aniWave * 0.01)).b   ;

            vec4 distor2 = vec4(vec3(abs(0.25 - r1) , fract(abs(0.15 + aniWave - g1) * 2.), fract(abs(aniWave - b1 ) * 1.5)), 1.);

            vec4 mix2 = mix(
                texture_1, 
                distor2, 
                step(
                    0.5,
                    abs(0.25 - dot(
                        distor2.rgb, dotColor.rgb
                    ))
                ));

            vec4 txt1 = mix(texture_1, pink, step(uProgress - 0.02, progWave * 0.5 + 0.5));
            vec4 txt2 = mix(vec4(1.), mix2, step(uProgress + 0.02, progWave * 0.5 + 0.5));
          

            gl_FragColor = mix(txt1, txt2, step(uProgress, progWave * 0.5 + 0.5));
			
        }
    `
}