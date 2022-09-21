in vec3 worldPosition;
in vec3 modelPosition;

uniform vec3 alphaColor;
uniform vec3 betaColor;
uniform float blend;

void main() {
	vec3 surface = mix(alphaColor, betaColor, mix(round(worldPosition.z), worldPosition.z, blend) / 10.0);

	gl_FragColor = vec4(surface, 1.0);
}