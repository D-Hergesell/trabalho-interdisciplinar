# ==============================================================================
# ESTÁGIO 1: Build (Compilação)
# Usa uma imagem Maven com JDK 21 para compilar o projeto
# ==============================================================================
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# 1. Copia apenas o pom.xml primeiro.
# Isso permite que o Docker faça cache das dependências. Se você mudar apenas o código
# e não o pom.xml, o Docker não precisará baixar tudo de novo.
COPY pom.xml .

# 2. Baixa as dependências para o modo offline
RUN mvn dependency:go-offline

# 3. Copia o restante do código fonte (src)
COPY src ./src

# 4. Compila o projeto e gera o arquivo .jar (pula os testes para agilizar o deploy)
RUN mvn clean package -DskipTests

# ==============================================================================
# ESTÁGIO 2: Run (Execução)
# Usa uma imagem leve (Alpine) apenas com o JRE 21 para rodar a aplicação
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copia o .jar gerado no estágio anterior para a imagem final
# O wildcard (*.jar) pega o arquivo independente da versão no nome
COPY --from=build /app/target/*.jar app.jar

# Define a variável de ambiente PORT (O Render injeta isso automaticamente)
# Mas deixamos 8080 como valor padrão caso a variável não exista
ENV PORT=8080

# Expõe a porta para o Render saber onde ouvir
EXPOSE 8080

# Comando para iniciar a aplicação Java
# O "-Dserver.port=$PORT" garante que o Spring use a porta definida pelo Render
ENTRYPOINT ["java", "-jar", "app.jar"]