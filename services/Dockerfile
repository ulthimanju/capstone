FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Build argument to specify which microservice to copy
ARG SERVICE_NAME

# Copy the pre-built executable fat JAR from target directory
COPY services/${SERVICE_NAME}/target/${SERVICE_NAME}-1.0.0.jar app.jar

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
