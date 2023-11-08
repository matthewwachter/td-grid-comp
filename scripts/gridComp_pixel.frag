// Projection Alignment Grid Generator

#include <common> // include common

uniform vec4 bg_c; // background color

uniform vec4 grid_c; // grid color
uniform float grid_w; // grid line width
uniform vec2 grid_s; // grid vertical divisions
					 // grid cross

uniform vec4 circlegrid_c; // circlegrid color
uniform vec4 circlegrid_s; // circlegrid line width
						   // circlegrid size
						   // circlegrid offset x
						   // circle grid offset y

uniform vec4 circle_c; // circle color
uniform float circle_w; // circle line width

uniform vec4 diag1_c; // TL to BR diagonal color
uniform vec4 diag2_c; // BL to TR diagonal color
uniform vec2 diag_s; // diagonal line width
					 // diagonal line mode

uniform vec4 centerh_c; // horizontal centerline color
uniform vec4 centerv_c; // vertical centerline color
uniform float center_w; // center line width

uniform vec4 rainbow_s; // rainbow line width
						// rainbow alpha
						// rainbow period
						// rainbow offset

uniform vec4 border_c; // border color
uniform float border_w; // border line width

uniform vec4 logo_c1; // logo color 1
uniform vec4 logo_c2; // logo color 2
uniform vec4 logo_c3; // logo color 3
uniform vec2 logo_s; // logo type
					 // logo size

// grid
void grid(vec2 p, float px_size, inout vec4 fragColor)
{
    float gc = (1.0 - grid_s.y)*.5;
    vec2 grid = p - round(p*grid_s.x)/grid_s.x;
    grid *= grid_s.x;
    float d = min(abs(grid.x), abs(grid.y));
    vec2 cross = vec2(step(gc, abs(grid.x)), step(gc, abs(grid.y)));
    d += max(cross.x, cross.y);
    stroke(d, grid_c, fragColor, grid_s.x*grid_w*px_size);
}

// circle grid
void circleGrid(vec2 p, float px_size, inout vec4 fragColor)
{
    p -= circlegrid_s.zw/grid_s.x;
    vec2 cell = mod(p * vec2(grid_s.x), 1.0);
    vec2 center = mod(vec2(.5), 1.0);
    float radius = circlegrid_s.y;
    vec2 dist = cell - center;
    float d = length(dist) - radius;
    strokeAA(d, circlegrid_c, fragColor, circlegrid_s.x*grid_s.x * px_size, length(fwidth(p*grid_s.x)));
}

// circle
void circle(vec2 p, vec2 center, float radius, vec4 c, float px_size, inout vec4 fragColor)
{
    center = center + round(p);
    
    float d = length(p - center) - radius;
    strokeAA(d, c, fragColor, circle_w * px_size, length(fwidth(p)));
}

// rainbow circle
void rainbowCircle(vec2 p, vec2 center, float radius, vec4 c, float px_size, inout vec4 fragColor)
{
	vec2 pq = vec2(atan(p.x, p.y) / TAU*rainbow_s.z + rainbow_s.w, length(p));
	float d = length(p - center) - radius;
	c = vec4(hsv2rgb(vec3(pq.x, 1., 1.)), rainbow_s.y);
	strokeAA(d, c, fragColor, rainbow_s.x * px_size, length(fwidth(p)));
}

// horizontal center line
void centerH(vec2 p, float px_size, inout vec4 fragColor)
{
    
    stroke(abs(p.x), centerh_c, fragColor, center_w*px_size);
    p = mod(p, 1)-.5;
    stroke(abs(p.x), centerh_c, fragColor, center_w*px_size);
}

// vertical center line
void centerV(vec2 p, float px_size, inout vec4 fragColor)
{
    stroke(abs(p.y), centerv_c, fragColor, center_w*px_size);
    p = mod(p, 1)-.5;
    stroke(abs(p.y), centerh_c, fragColor, center_w*px_size);
}

// diagonal lines
void diagonals(vec2 p, float px_size, float aspect, inout vec4 fragColor)
{
	p += .5;
	p = mod(p, 1);

	if (diag_s.y == 1.0)
	{
	    p = vUV.st;
	}
	float dist = abs(p.x - p.y);
	strokeAA(dist, diag1_c, fragColor, diag_s.x*px_size, length(fwidth(p)));
	
	dist = abs(p.x + p.y)-1.0;
	strokeAA(dist, diag2_c, fragColor, diag_s.x*px_size, length(fwidth(p)));
	//fragColor = vec4(vec3(dist), 1.0);
}

// render border
void border(vec2 p, vec2 res, inout vec4 fragColor)
{
	float d = min(min(p.x, 1.0-p.x)*res.x, min(p.y, 1.0-p.y)*res.y);
	fragColor = mix(fragColor, border_c, (1.0-step(border_w, d))*border_c.a);
}

// input logo
void inputLogo(vec2 p, vec2 offset, float scale, float aspect, float px_size, inout vec4 fragColor)
{
	p -= offset;
	p /= scale;
	p.x /= uTD2DInfos[0].res.y / uTD2DInfos[0].res.x;
	
	vec4 img = texture(sTD2DInputs[0], (p/2) + .5);
	
	fragColor = mix(fragColor, img, img.a);
}

// td logo
void tdLogo(vec2 p, vec2 offset, float scale, float aspect, float px_size, inout vec4 fragColor)
{
	p -= offset;
	p /= .75;
	
	float w = 80*px_size*scale;
	vec4 c = vec4(0.0, 0.0, 0.0, 1.0);
	
	float bx = sdBox(p, vec2(scale, scale), vec2(0.0));
	fragColor = mix(fragColor, logo_c3, (1.0-step(0.0, bx))*logo_c3.a);
	//stroke(bx, logo_c1, fragColor, w);
	
	vec2 v0 = vec2(-.56*scale, .56*scale);
	vec2 v1 = vec2(.56*scale, .56*scale);
	
	float cr = sdCircle(p, scale*.41);
	

	vec2 smbx_s = vec2(scale *.13);
	float smbx = sdBox(p, vec2(scale*.11), vec2(0,0));
	smbx = min(smbx, sdBox(p, smbx_s, v0));
	smbx = min(smbx, sdBox(p, smbx_s, v1));
	smbx = min(smbx, sdBox(p, smbx_s, -v1));
	smbx = min(smbx, sdBox(p, smbx_s, -v0));

	float d = sdSegment(p, vec2(0.0, scale), vec2(0.0, -scale));
	d += step(0.0, bx);
	d = min(abs(d), abs(sdSegment(p, v0, -v0)));
	d = min(abs(d), abs(sdSegment(p, v1, -v1)));
	d -= (1.0-step(0.0, smbx));
	d = min(d, cr);
	float dc = smoothstep(0.5 * (w + length(fwidth(p))), 0.5 * (w - length(fwidth(p))), abs(d) );
	fragColor = mix(fragColor, logo_c1, dc*logo_c1.a);
	//strokeAA(d, logo_c1, fragColor, w, length(fwidth(p)));
	
	//float cr = sdCircle(p, scale*.41);
	float cr_a = 1.0 - step(0.0, cr)-dc;
	fragColor = mix(fragColor, logo_c2, max(0.0, cr_a)*logo_c2.a);
	//strokeAA(cr, logo_c1, fragColor, w, length(fwidth(p)));
	

	
	fragColor = mix(fragColor, logo_c1, (1.0-step(0.0, smbx))*logo_c1.a);
}

// derivative logo
void derivativeLogo(vec2 p, vec2 offset, float scale, float aspect, float px_size, inout vec4 fragColor)
{
	p -= offset;
	p /= scale;
	
	vec4 c = vec4(1.0, 0.0, 0.0, 1.0);
	
	vec2 v1 = vec2(.072, .505);
	vec2 v2 = vec2(-.42, -0.055);
	vec2 v3 = vec2(.38, -0.5);
	
	float sdc = sdCircle(p+v1, .3);
	float sdp = sdDistortedPill(p, v2, v3, .3, 2.28, .85);
	float dc = smoothstep(-length(fwidth(p)), length(fwidth(p)), min(sdc, sdp));
	
	fragColor = mix(fragColor, logo_c2, (1.0-dc) * logo_c2.a);
}

// mw logo
void mwLogo(vec2 p, vec2 offset, float scale, float aspect, float px_size, inout vec4 fragColor)
{
	p -= offset;
	p.y *= .6;
	p /= scale;
	
	
	float w = 20.0 * px_size;
	
	vec2 ra =vec2(0.5,0.5);
	float d1 = sdRhombus( vec2(p.x + .5, p.y), ra );
	float d2 = sdRhombus( vec2(p.x - .5, p.y), ra );
	fragColor = mix(fragColor, vec4(vec3(pow(min(d1+.95, d2+.95), 8)), 1.0)*logo_c3, (1.0-step(0.0, min(d1, d2)))*logo_c3.a);
	strokeAA(min(d1, d2), logo_c2, fragColor, w, length(fwidth(p)));
	strokeAA(min(d1+.1, d2+.1), logo_c2 * vec4(0.8), fragColor, w, length(fwidth(p)));
	strokeAA(min(d1+.2, d2+.2), logo_c2 * vec4(0.6), fragColor, w, length(fwidth(p)));
	strokeAA(min(d1+.3, d2+.3), logo_c2 * vec4(0.4), fragColor, w, length(fwidth(p)));
	
	float d3 = sdSegment(p, vec2(1.0, 0.0), vec2(-1.0, 0.0));
	strokeAA(d3, logo_c2, fragColor, w, length(fwidth(p)));
}


out vec4 fragColor;
void main()
{
    // resolution
    vec2 res = uTDOutputInfo.res.zw;
    
    // aspect ratio
    float aspect = res.x / res.y;
	
	// aspect correct coordinates
	vec2 p = vUV.st-.5;
	
	vec2 logo_offset = vec2(0.0, 0.0);
	
	// pixel size
	float px_size = 0.0;
	
	// alignment for different aspect ratios
	if (aspect > 1.0)
	{
		p.x *= aspect;
		logo_offset.x = (aspect>1.0+logo_s.y*2)?.5 : .25;
		px_size = 1.0/res.y;
	} else {
		p.y /= aspect;
		logo_offset.y = (aspect<1.0-logo_s.y*2)?.5 : .25;
		px_size = 1.0/res.x;
	} 
	

	
	// background color
	fragColor = bg_c;
	
	// square grid
	grid(p, px_size, fragColor);
	
	// circle grid
	circleGrid(p, px_size, fragColor);
	
	// big circles
    circle(p, vec2(0), 0.5, circle_c, px_size, fragColor);
    
    // diagonal lines
    diagonals(p, px_size, aspect, fragColor);
    
    // vertical center lines
	centerV(p, px_size, fragColor);
	
	// horizontal center lines
	centerH(p, px_size, fragColor);
	
	// rainbow circle
    rainbowCircle(p, vec2(0), .333, vec4(1.0), px_size, fragColor);

	// border lines
    //vec2 b_pos = vec2(vUV.x * aspect, vUV.y);
    //b_pos = vUV.xy * res;
    border(vUV.st, res, fragColor);
    

	// logos
	if (logo_s.x == 1) // image logo
	{
		inputLogo(p, logo_offset, logo_s.y, aspect, px_size, fragColor);
		inputLogo(p, -logo_offset, logo_s.y, aspect, px_size, fragColor);
	} else if (logo_s.x == 2) // td logo
	{
		tdLogo(p, logo_offset, logo_s.y, aspect, px_size, fragColor);
		tdLogo(p, -logo_offset, logo_s.y, aspect, px_size, fragColor);
	} else if (logo_s.x == 3) // derivative logo
	{
		derivativeLogo(p, logo_offset, logo_s.y, aspect, px_size, fragColor);
		derivativeLogo(p, -logo_offset, logo_s.y, aspect, px_size, fragColor);
	} else if (logo_s.x == 4) // mw logo
	{
		mwLogo(p, logo_offset, logo_s.y, aspect, px_size, fragColor);
		mwLogo(p, -logo_offset, logo_s.y, aspect, px_size, fragColor);
	}
}
