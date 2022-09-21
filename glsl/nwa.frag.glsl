in vec3 worldPosition;
in vec3 modelPosition;

uniform vec3 alphaColor;
uniform vec3 betaColor;

void main() {
	gl_FragColor = vec4(mix(alphaColor, betaColor, worldPosition.z / 10.0), 1);
}