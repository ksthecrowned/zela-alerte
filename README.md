# Zela Alerte - Application de Signalement de Coupures

Application mobile pour signaler en temps réel les coupures d'électricité, d'eau et d'internet au Congo-Brazzaville.

## Configuration Firebase

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet
3. Activez les services suivants :
   - Authentication (Email/Password)
   - Cloud Firestore
   - Cloud Messaging

### 2. Configuration de l'authentification

1. Dans Firebase Console, allez dans Authentication > Sign-in method
2. Activez "Email/Password"
3. Désactivez "Email link (passwordless sign-in)" si vous ne l'utilisez pas

### 3. Configuration de Firestore

1. Créez une base de données Firestore en mode test
2. Copiez les règles de sécurité depuis le fichier `firestore.rules`
3. Appliquez ces règles dans l'onglet "Rules" de Firestore

### 4. Configuration des variables d'environnement

1. Copiez le fichier `.env` et renommez-le selon votre environnement
2. Remplissez les variables avec vos clés Firebase :

```env
EXPO_PUBLIC_FIREBASE_API_KEY=votre_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=votre_projet_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

### 5. Configuration des notifications push

1. Dans Firebase Console, allez dans Project Settings > Cloud Messaging
2. Générez une clé de serveur pour les notifications push
3. Pour iOS : Ajoutez votre certificat APNs
4. Pour Android : La configuration FCM est automatique

## Structure de la base de données

### Collection `users`
```typescript
{
  id: string,
  email: string,
  displayName: string,
  city: string,
  notificationPreferences: {
    electricity: boolean,
    water: boolean,
    internet: boolean,
    allUpdates: boolean
  },
  fcmToken: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Collection `reports`
```typescript
{
  id: string,
  userId: string,
  userName: string,
  userEmail: string,
  city: string,
  neighborhood: string,
  serviceType: 'electricity' | 'water' | 'internet',
  status: 'outage' | 'restored',
  description: string,
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Fonctionnalités

- ✅ Authentification Firebase (email/mot de passe)
- ✅ Signalement en temps réel des coupures
- ✅ Feed communautaire avec filtres
- ✅ Notifications push (configuration requise)
- ✅ Gestion du profil utilisateur
- ✅ Thème sombre/clair
- ✅ Règles de sécurité Firestore

## Installation

1. Clonez le projet
2. Installez les dépendances : `npm install`
3. Configurez Firebase (voir ci-dessus)
4. Lancez l'application : `npm run dev`

## Déploiement

Pour déployer l'application en production :

1. Configurez les variables d'environnement de production
2. Mettez à jour les règles Firestore en mode production
3. Configurez les notifications push pour votre domaine
4. Testez toutes les fonctionnalités avant le lancement

## Support

Pour toute question ou problème, consultez la documentation Firebase ou créez une issue dans le projet.# zela-alerte
