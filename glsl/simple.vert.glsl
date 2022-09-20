out vec3 worldPosition;
out vec3 modelPosition;

void main() {
	worldPosition = vec3(modelMatrix * vec4(position, 1.0));
	modelPosition = position;

	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}