// Íñigo Quílez
// https://iquilezles.org/articles/distfunctions2d/

#define     TAU 6.28318530717958647 // pi * 2
#define     PI  3.14159265358979323 // pi

// hsv to rgb
vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);
  rgb = rgb * rgb * (3. - 2. * rgb);
  return c.z * mix(vec3(1.), rgb, c.y);
}

// sd polygon
const int N = 8;
float sdPolygon( in vec2 p, in vec2[N] v )
{
    const int num = v.length();
    float d = dot(p-v[0],p-v[0]);
    float s = 1.0;
    for( int i=0, j=num-1; i<num; j=i, i++ )
    {
        // distance
        vec2 e = v[j] - v[i];
        vec2 w =    p - v[i];
        vec2 b = w - e*clamp( dot(w,e)/dot(e,e), 0.0, 1.0 );
        d = min( d, dot(b,b) );

        // winding number from http://geomalgorithms.com/a03-_inclusion.html
        bvec3 cond = bvec3( p.y>=v[i].y, 
                            p.y <v[j].y, 
                            e.x*w.y>e.y*w.x );
        if( all(cond) || all(not(cond)) ) s=-s;  
    }
    
    return s*sqrt(d);
}

// sd segment
float sdSegment( in vec2 p, in vec2 a, in vec2 b )
{
    vec2 pa = p-a, ba = b-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}

// sd box
float sdBox( vec2 p, vec2 b, vec2 o)
{
    p -= o;
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

// sd circle
float sdCircle( vec2 p, float r )
{
    return length(p) - r;
}

float ndot(vec2 a, vec2 b ) { return a.x*b.x - a.y*b.y; }

// sd rhombus
float sdRhombus( in vec2 p, in vec2 b ) 
{
    p = abs(p);

    float h = clamp( ndot(b-2.0*p,b)/dot(b,b), -1.0, 1.0 );
    float d = length( p-0.5*b*vec2(1.0-h,1.0+h) );

	return d * sign( p.x*b.y + p.y*b.x - b.x*b.y );
}

// sd distorted pill
float sdDistortedPill(vec2 p, vec2 start, vec2 end, float radius, float power, float depth)
{
    p = -p;
    vec2 dir = normalize(end - start);

    vec2 localP = p - start;
    float proj = dot(localP, dir);
    float perpProj = dot(localP, vec2(-dir.y, dir.x));

    float alongLine = clamp(proj, 0.0, length(end - start));
    vec2 closestPoint = start + dir * alongLine;

    float d = length(p - closestPoint) - radius;

    float frequency = PI / length(end - start);
    float sind = sin(frequency * alongLine);
    sind = pow(sind, power);
    sind *= depth*radius;
    
    return d + sind;
}


// stroke edge
void stroke(float d, vec4 c, inout vec4 fragColor, float w)
{
    float m = 1.0-step(.5*w, abs(d));
    fragColor = mix(fragColor, c, m*c.a);
}

// stroke edge with anti-aliasing
void strokeAA(float d, vec4 c, inout vec4 fragColor, float w, float aa)
{
    float m = smoothstep(0.5 * (w + aa), 0.5 * (w - aa), abs(d));
    fragColor = mix(fragColor, c, m*c.a);
}