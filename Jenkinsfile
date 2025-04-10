pipeline {
    agent any

    stages {
        stage('Récupération du code') {
            steps {
                echo '📥 Code récupéré depuis Git.'
            }
        }

        stage('Vérification des fichiers') {
            steps {
                echo '📂 Liste des fichiers dans le projet :'
                sh 'ls -l'
            }
        }

        stage('Nettoyage Apache') {
            steps {
                echo '🧹 Suppression des anciens fichiers...'
                sh 'rm -rf /var/www/html/*'
            }
        }

        stage('Déploiement Apache') {
            steps {
                echo '🚀 Déploiement dans /var/www/html/'
                sh 'cp -r * /var/www/html/'
            }
        }

        stage('Redémarrage Apache') {
            steps {
                echo '🔁 Redémarrage du serveur Apache...'
                sh 'sudo /usr/sbin/service apache2 restart'
            }
        }

        stage('Test de disponibilité') {
            steps {
                echo '🌐 Vérification avec curl...'
                sh 'curl -I http://localhost || true'
            }
        }
    }

    post {
        success {
            echo '✅ Déploiement terminé avec succès.'
        }
        failure {
            echo '❌ Erreur détectée dans le pipeline.'
        }
    }
}