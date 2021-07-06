
uniform sampler2D textureSampler;
uniform vec2      iResolution;           // viewport resolution (in pixels)
uniform float     iTime;                 // shader playback time (in seconds)

uniform vec2	  iWaveCentre;	 
uniform float	  iIntensity;	 		
//uniform samplerXX iChannel0..3;          // input channel. XX = 2D/Cube

varying vec2 vUV;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	
	 //Sawtooth function to pulse from centre.
    float offset = (iTime- floor(iTime))/iTime;
	float CurrentTime = (iTime)*(offset);    
    
	vec3 WaveParams = vec3(10.0, 0.8, 0.1 ); 
	
	WaveParams.z = iIntensity;
    
    float ratio = iResolution.y/iResolution.x;
    
    //Use this if you want to place the centre with the mouse instead
	//vec2 WaveCentre = vec2( iMouse.xy / iResolution.xy );
       
   // vec2 WaveCentre = vec2(0.5, 0.5);
   // WaveCentre.y *= ratio; 
   
	vec2 texCoord = fragCoord.xy / iResolution.xy;      
    //texCoord.y *= ratio;    
	vec2 adjCoord = texCoord;
	adjCoord.y *= ratio;
	
	float Dist = distance(texCoord, iWaveCentre);
    
	
	vec4 Color = texture2D(textureSampler, texCoord);
    
//Only distort the pixels within the parameter distance from the centre
if ((Dist <= ((CurrentTime) + (WaveParams.z))) && 
	(Dist >= ((CurrentTime) - (WaveParams.z)))) 
	{
        //The pixel offset distance based on the input parameters
		float Diff = (Dist - CurrentTime); 
		float ScaleDiff = (1.0 - pow(abs(Diff * WaveParams.x), WaveParams.y)); 
		float DiffTime = (Diff  * ScaleDiff);
        
        //The direction of the distortion
		vec2 DiffTexCoord = normalize(texCoord - iWaveCentre);         
        
        //Perform the distortion and reduce the effect over time
		texCoord += ((DiffTexCoord * DiffTime) / (CurrentTime * Dist * 40.0));
		Color = texture2D(textureSampler, texCoord);
        
        //Blow out the color and reduce the effect over time
		Color += (Color * ScaleDiff) / (CurrentTime * Dist * 40.0);
	} 
    
	fragColor = Color;
}

void main() 
{
    mainImage(gl_FragColor, vUV * iResolution.xy);
}
