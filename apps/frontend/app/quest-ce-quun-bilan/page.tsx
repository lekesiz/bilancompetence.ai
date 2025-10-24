import React from 'react';

const BilanPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Qu'est-ce qu'un Bilan de Compétences ?</h1>
      
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
        <p className="font-bold">Le saviez-vous ?</p>
        <p>Le terme "bilan de compétences" vient du français "bilan" (évaluation, inventaire) et "compétences" (savoirs, savoir-faire et savoir-être). C'est une démarche spécifiquement française, reconnue pour sa rigueur méthodologique et son encadrement légal.</p>
      </div>

      <h2 className="text-2xl font-bold mb-2">Définition du bilan de compétences</h2>
      <p className="mb-4">Le bilan de compétences est une démarche personnalisée qui permet à toute personne active d'analyser ses compétences professionnelles et personnelles, ses aptitudes et ses motivations. Cette analyse approfondie aide à définir un projet professionnel cohérent et, le cas échéant, un projet de formation adapté.</p>

      <h2 className="text-2xl font-bold mb-2">Cadre légal du bilan de compétences</h2>
      <p className="mb-4">Le bilan de compétences est encadré par le Code du travail français. Selon les articles L6313-4 et R6313-4, les actions permettant de réaliser un bilan de compétences ont pour objet de permettre à des travailleurs d'analyser leurs compétences professionnelles et personnelles ainsi que leurs aptitudes et leurs motivations afin de définir un projet professionnel et, le cas échéant, un projet de formation.</p>

      <h2 className="text-2xl font-bold mb-2">Objectifs du bilan de compétences</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Analyser vos compétences</li>
        <li>Définir un projet professionnel</li>
        <li>Élaborer un plan de formation</li>
        <li>Clarifier vos motivations</li>
      </ul>

      <h2 className="text-2xl font-bold mb-2">Pour qui est destiné le bilan de compétences ?</h2>
      <p className="mb-4">Le bilan de compétences s'adresse à toute personne active, quels que soient son âge, son niveau de qualification ou son statut professionnel.</p>

      <h2 className="text-2xl font-bold mb-2">Avantages et bénéfices du bilan de compétences</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Meilleure connaissance de soi</li>
        <li>Valorisation de votre parcours</li>
        <li>Prise de recul</li>
        <li>Confiance en soi renforcée</li>
        <li>Projet professionnel cohérent</li>
        <li>Plan d'action concret</li>
      </ul>

      <h2 className="text-2xl font-bold mb-2">Ce qu'un bilan de compétences n'est PAS</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Ce n'est pas une formation</li>
        <li>Ce n'est pas une validation des acquis (VAE)</li>
        <li>Ce n'est pas une aide à la résolution de conflits</li>
        <li>Ce n'est pas du coaching</li>
      </ul>
    </div>
  );
};

export default BilanPage;

