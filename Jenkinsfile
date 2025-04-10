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

        stage('Déploiement local simulé') {
            steps {
                echo 'Copie des fichiers dans le dossier deploy/'
                sh 'mkdir -p deploy'
                sh 'cp -r *.html *.css *.js deploy/'
                sh 'ls -l deploy'
            }
        }
    }
}
