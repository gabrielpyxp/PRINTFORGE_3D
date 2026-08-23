FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY pom.xml .
RUN mvn -B -ntp dependency:go-offline

COPY src ./src
RUN mvn -B -ntp package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

RUN addgroup --system spring && adduser --system --ingroup spring spring
COPY --from=build /workspace/target/calculadora-precificacao-1.0.0.jar app.jar

USER spring
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
