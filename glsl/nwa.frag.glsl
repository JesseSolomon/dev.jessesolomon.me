in vec3 worldPosition;
in vec3 modelPosition;

uniform vec3 alphaColor;
uniform vec3 betaColor;

void main() {
	vec3 surface = mix(alphaColor, betaColor, round(worldPosition.z) / 10.0);

	gl_FragColor = vec4(surface, 1);
}