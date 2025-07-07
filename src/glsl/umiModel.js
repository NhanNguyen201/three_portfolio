export default {
    vertex: `
        uniform float uTime;
        varying float vWave;
        varying vec3 vNormal;

        float PI = 3.141618;
        float fre = 3.;

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
            vec2 vUv = uv ;
            vNormal = normal;
            float wave = noise(vec2((vUv.x  + uTime * 2.) * fre, (vUv.y + uTime * 3.) * fre));
            vWave = wave ;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragment: `

        uniform float uTime;

        varying vec3 vNormal;
        varying float vWave;

        vec4 toRgb (vec4 c) {
            return vec4(c[0] / 255., c[1] / 255., c[2] / 255., c[3] );
        }
        vec2 rotateUV(vec2 uv, float rotation, vec2 mid) {
            return vec2(
            cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
            cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
            );
        }
        void main() {
            float wave = vWave * 0.45; // 0.45

			float roundLight = step(0.5, dot(vec3(sin(uTime * 10.), 0., cos(uTime * 10.)), vNormal));

            vec4 skinColor = toRgb(vec4(224., 175., 105., 1.));
            
            float r1 =  wave * 0.06;
            float g1 =   wave * 0.005;
            float b1 =  wave * 0.01;

            vec3 distorColor = vec3(fract(abs(0.5  - r1  -wave)), fract(abs(0.75 - g1 -wave) * 1.5) , fract((0.5 - b1 -wave)  *  1.25 ));
            vec4 distor = vec4(distorColor, 1.);


            gl_FragColor = mix(
                distor, 
                skinColor,   
                roundLight
			);
			
        }
    `
}