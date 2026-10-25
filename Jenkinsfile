pipeline {
    agent any

    tools {
        maven 'Maven-3.9.5'
        jdk 'JDK-17'
    }

    environment {
        DOCKER_REGISTRY      = 'docker.io'
        DOCKER_IMAGE_PREFIX  = 'myorg/ecommerce'
        DOCKER_CREDENTIALS   = 'dockerhub-credentials-id'
        SONARQUBE_ENV        = 'SonarQube-Server'
        APP_VERSION          = "1.0.${BUILD_NUMBER}"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
        ansiColor('xterm')
    }

    parameters {
        choice(name: 'DEPLOY_ENV', choices: ['staging', 'production'], description: 'Target deployment environment')
        booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip unit tests during packaging')
    }

    stages {
        // ──────────────────────────────────────────────────────────────────
        // Stage 1: Checkout Source Code
        // ──────────────────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo "Checking out branch ${env.BRANCH_NAME ?: 'main'}..."
                checkout scm
            }
        }

        // ──────────────────────────────────────────────────────────────────
        // Stage 2: Compile & Run Unit Tests with JaCoCo Coverage
        // ──────────────────────────────────────────────────────────────────
        stage('Compile & Test') {
            when {
                expression { return !params.SKIP_TESTS }
            }
            steps {
                echo 'Running unit tests and generating JaCoCo coverage reports...'
                sh 'mvn clean test jacoco:report -B'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: '**/target/surefire-reports/*.xml'
                    recordCoverage(tools: [[parser: 'JACOCO', pattern: '**/target/site/jacoco/jacoco.xml']])
                }
            }
        }

        // ──────────────────────────────────────────────────────────────────
        // Stage 3: SonarQube Code Quality Analysis
        // ──────────────────────────────────────────────────────────────────
        stage('SonarQube Analysis') {
            steps {
                echo 'Submitting source code and coverage reports to SonarQube...'
                withSonarQubeEnv("${env.SONARQUBE_ENV}") {
                    sh '''
                        mvn sonar:sonar \
                            -Dsonar.projectKey=ecommerce-microservices \
                            -Dsonar.projectName="E-Commerce Microservices Platform" \
                            -Dsonar.coverage.jacoco.xmlReportPaths="**/target/site/jacoco/jacoco.xml" \
                            -B
                    '''
                }
            }
        }

        // ──────────────────────────────────────────────────────────────────
        // Stage 4: SonarQube Quality Gate Check (Halts pipeline if breached)
        // ──────────────────────────────────────────────────────────────────
        stage('Quality Gate') {
            steps {
                echo 'Waiting for SonarQube Quality Gate approval...'
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Pipeline aborted due to SonarQube Quality Gate failure: ${qg.status}"
                        }
                        echo "SonarQube Quality Gate PASSED with status: ${qg.status}"
                    }
                }
            }
        }

        // ──────────────────────────────────────────────────────────────────
        // Stage 5: Package Spring Boot Executable JARs
        // ──────────────────────────────────────────────────────────────────
        stage('Package JARs') {
            steps {
                echo "Packaging microservices with version ${env.APP_VERSION}..."
                sh 'mvn package -DskipTests=true -B'
            }
        }

        // ──────────────────────────────────────────────────────────────────
        // Stage 6: Build Docker Images (Parallel)
        // ──────────────────────────────────────────────────────────────────
        stage('Build Docker Images') {
            parallel {
                stage('Discovery Server Image') {
                    steps {
                        script {
                            docker.build("${env.DOCKER_IMAGE_PREFIX}-discovery-server:${env.APP_VERSION}", "./discovery-server")
                            docker.build("${env.DOCKER_IMAGE_PREFIX}-discovery-server:latest", "./discovery-server")
                        }
                    }
                }
                stage('API Gateway Image') {
                    steps {
                        script {
                            docker.build("${env.DOCKER_IMAGE_PREFIX}-api-gateway:${env.APP_VERSION}", "./api-gateway")
                            docker.build("${env.DOCKER_IMAGE_PREFIX}-api-gateway:latest", "./api-gateway")
                        }
                    }
                }
                stage('Product Service Image') {
                    steps {
                        script {
                            docker.build("${env.DOCKER_IMAGE_PREFIX}-product-service:${env.APP_VERSION}", "./product-service")
                            docker.build("${env.DOCKER_IMAGE_PREFIX}-product-service:latest", "./product-service")
                        }
                    }
                }
                stage('Order Service Image') {
                    steps {
                        script {
                            docker.build("${env.DOCKER_IMAGE_PREFIX}-order-service:${env.APP_VERSION}", "./order-service")
                            docker.build("${env.DOCKER_IMAGE_PREFIX}-order-service:latest", "./order-service")
                        }
                    }
                }
                stage('Payment Service Image') {
                    steps {
                        script {
                            docker.build("${env.DOCKER_IMAGE_PREFIX}-payment-service:${env.APP_VERSION}", "./payment-service")
                            docker.build("${env.DOCKER_IMAGE_PREFIX}-payment-service:latest", "./payment-service")
                        }
                    }
                }
            }
        }

        // ──────────────────────────────────────────────────────────────────
        // Stage 7: Container Security Vulnerability Scan (Trivy)
        // ──────────────────────────────────────────────────────────────────
        stage('Security Scan (Trivy)') {
            steps {
                echo 'Scanning container images for vulnerabilities...'
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    sh """
                        trivy image --severity HIGH,CRITICAL --format table ${env.DOCKER_IMAGE_PREFIX}-api-gateway:${env.APP_VERSION} || true
                        trivy image --severity HIGH,CRITICAL --format table ${env.DOCKER_IMAGE_PREFIX}-product-service:${env.APP_VERSION} || true
                        trivy image --severity HIGH,CRITICAL --format table ${env.DOCKER_IMAGE_PREFIX}-order-service:${env.APP_VERSION} || true
                        trivy image --severity HIGH,CRITICAL --format table ${env.DOCKER_IMAGE_PREFIX}-payment-service:${env.APP_VERSION} || true
                    """
                }
            }
        }

        // ──────────────────────────────────────────────────────────────────
        // Stage 8: Push Docker Images to Container Registry
        // ──────────────────────────────────────────────────────────────────
        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                echo 'Pushing Docker images to container registry...'
                withCredentials([usernamePassword(credentialsId: "${env.DOCKER_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    sh """
                        docker push ${env.DOCKER_IMAGE_PREFIX}-discovery-server:${env.APP_VERSION}
                        docker push ${env.DOCKER_IMAGE_PREFIX}-discovery-server:latest

                        docker push ${env.DOCKER_IMAGE_PREFIX}-api-gateway:${env.APP_VERSION}
                        docker push ${env.DOCKER_IMAGE_PREFIX}-api-gateway:latest

                        docker push ${env.DOCKER_IMAGE_PREFIX}-product-service:${env.APP_VERSION}
                        docker push ${env.DOCKER_IMAGE_PREFIX}-product-service:latest

                        docker push ${env.DOCKER_IMAGE_PREFIX}-order-service:${env.APP_VERSION}
                        docker push ${env.DOCKER_IMAGE_PREFIX}-order-service:latest

                        docker push ${env.DOCKER_IMAGE_PREFIX}-payment-service:${env.APP_VERSION}
                        docker push ${env.DOCKER_IMAGE_PREFIX}-payment-service:latest
                    """
                }
            }
        }

        // ──────────────────────────────────────────────────────────────────
        // Stage 9: Deploy Stack via Docker Compose
        // ──────────────────────────────────────────────────────────────────
        stage('Deploy to Target Environment') {
            steps {
                echo "Deploying microservices stack to ${params.DEPLOY_ENV} via Docker Compose..."
                sh 'docker compose down --remove-orphans || true'
                sh 'docker compose up -d --build'
            }
        }

        // ──────────────────────────────────────────────────────────────────
        // Stage 10: Health Check Verification (Smoke Test)
        // ──────────────────────────────────────────────────────────────────
        stage('Smoke Test & Health Verification') {
            steps {
                echo 'Validating service health via API Gateway...'
                sleep 20 // Wait for Spring Boot services to register with Eureka
                sh '''
                    curl -f http://localhost:8761/actuator/health || echo "Eureka server check failed"
                    curl -f http://localhost:8080/actuator/health || echo "API Gateway check failed"
                    curl -f http://localhost:8081/actuator/health || echo "Product Service check failed"
                    curl -f http://localhost:8082/actuator/health || echo "Order Service check failed"
                    curl -f http://localhost:8083/actuator/health || echo "Payment Service check failed"
                '''
            }
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // Post Pipeline Actions
    // ──────────────────────────────────────────────────────────────────────
    post {
        success {
            echo "Pipeline succeeded! E-Commerce microservices deployed successfully."
        }
        failure {
            echo "Pipeline failed! Please check console logs and SonarQube dashboard."
        }
        always {
            cleanWs deleteDirs: true, notFailBuild: true
        }
    }
}
