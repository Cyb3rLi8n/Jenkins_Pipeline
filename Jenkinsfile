pipeline {
    agent any

    stages {
        stage('Récupération du code') {
            steps {
                echo 'Code récupéré depuis Git.'
            }
        }

        stage('Vérification des fichiers') {
            steps {
                echo 'Liste des fichiers dans le projet :'
                sh 'ls -l'
            }
        }

        stage('Déploiement Apache') {
            steps {
                echo 'Déploiement dans Apache (/var/www/html/)'
                sh 'cp -r * /var/www/html/'
            }
        }

        stage('Redémarrage Apache') {
            steps {
                echo 'Redémarrage d\'Apache avec service...'
                sh 'sudo /usr/sbin/service apache2 restart'
            }
        }
    }
}