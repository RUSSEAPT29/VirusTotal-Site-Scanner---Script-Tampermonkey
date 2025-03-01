// ==UserScript==
// @name         VirusTotal Site Scanner Avancé
// @namespace    https://www.facebook.com/groups/1622285742013240?locale=fr_FR
// @version      0.2
// @description  Scanne le site visité avec VirusTotal avec un bouton et une barre de progression
// @author       Volodia
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    // Remplacez par votre clé API VirusTotal
    const apiKey = 'VOTRE_CLE_API_VIRUSTOTAL';

    // Ajout de styles CSS pour le bouton et la barre de progression
    GM_addStyle(`
        #vt-scanner-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 10000;
        }
        #vt-progress-bar {
            position: fixed;
            bottom: 60px;
            right: 20px;
            width: 200px;
            height: 10px;
            background-color: #f3f3f3;
            border-radius: 5px;
            overflow: hidden;
            display: none;
            z-index: 10000;
        }
        #vt-progress {
            height: 100%;
            width: 0;
            background-color: #007bff;
            transition: width 0.3s ease;
        }
    `);

    // Création du bouton et de la barre de progression
    const button = document.createElement('button');
    button.id = 'vt-scanner-button';
    button.textContent = 'Scanner avec VirusTotal';

    const progressBarContainer = document.createElement('div');
    progressBarContainer.id = 'vt-progress-bar';
    const progressBar = document.createElement('div');
    progressBar.id = 'vt-progress';
    progressBarContainer.appendChild(progressBar);

    document.body.appendChild(button);
    document.body.appendChild(progressBarContainer);

    // Fonction pour mettre à jour la barre de progression
    function updateProgressBar(progress) {
        progressBar.style.width = `${progress}%`;
    }

    // Fonction pour scanner l'URL avec VirusTotal
    function scanUrlWithVirusTotal(url) {
        progressBarContainer.style.display = 'block';
        updateProgressBar(10); // Début du scan

        const apiUrl = `https://www.virustotal.com/vtapi/v2/url/report?apikey=${apiKey}&resource=${encodeURIComponent(url)}`;

        GM_xmlhttpRequest({
            method: "GET",
            url: apiUrl,
            onload: function (response) {
                updateProgressBar(100); // Scan terminé
                setTimeout(() => {
                    progressBarContainer.style.display = 'none';
                    updateProgressBar(0); // Réinitialiser la barre
                }, 1000);

                const result = JSON.parse(response.responseText);
                if (result.response_code === 1) {
                    const positives = result.positives;
                    const total = result.total;
                    GM_notification({
                        title: 'Résultat du scan VirusTotal',
                        text: `Le site a été analysé : ${positives}/${total} détections.`,
                        timeout: 5000,
                    });
                } else {
                    GM_notification({
                        title: 'Erreur',
                        text: 'Le site n\'a pas pu être analysé par VirusTotal.',
                        timeout: 5000,
                    });
                }
            },
            onerror: function (error) {
                updateProgressBar(0); // Réinitialiser la barre en cas d'erreur
                progressBarContainer.style.display = 'none';
                GM_notification({
                    title: 'Erreur',
                    text: 'Une erreur s\'est produite lors de la requête à VirusTotal.',
                    timeout: 5000,
                });
            },
        });
    }

    // Ajout d'un événement au bouton pour lancer le scan
    button.addEventListener('click', () => {
        scanUrlWithVirusTotal(window.location.href);
    });
})();