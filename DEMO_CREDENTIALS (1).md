# 🎭 Demo Account Credentials

This document contains the credentials for demo accounts used for testing and demonstration purposes.

## 📧 Demo Accounts

### 👨‍💼 Admin Account (Organization Administrator)

**Full access to all features, including:**
- Organization management
- User management
- Qualiopi compliance
- Analytics and reports
- System configuration

```
Email: admin@demo.bilancompetence.ai
Password: Admin@Demo2025
Role: organization_admin
```

---

### 👨‍🏫 Consultant Account

**Access to:**
- Client management
- Assessment creation and management
- Session scheduling
- Progress tracking
- Reports generation

```
Email: consultant@demo.bilancompetence.ai
Password: Consultant@Demo2025
Role: consultant
```

---

### 👤 Client Account (Beneficiary)

**Access to:**
- Personal dashboard
- Assessment taking
- Results viewing
- Session booking
- Progress tracking

```
Email: client@demo.bilancompetence.ai
Password: Client@Demo2025
Role: beneficiary
```

---

## 🌱 Seeding Demo Data

To create these demo accounts and populate the database with sample data:

```bash
cd apps/backend
npm run seed:demo
```

This will create:
- ✅ 3 demo user accounts (admin, consultant, client)
- ✅ 1 demo organization
- ✅ Sample assessments
- ✅ Sample competencies
- ✅ Qualiopi indicators
- ✅ Satisfaction surveys

---

## 🔒 Security Notes

⚠️ **Important:**
- These credentials are for **demonstration purposes only**
- **DO NOT use these accounts in production**
- Change passwords immediately if used in any public environment
- Demo accounts should be deleted before production deployment

---

## 📊 Sample Data Included

### Assessments
- **Bilan de Compétences Complet** (In Progress)
- **Évaluation MBTI** (Completed)

### Competencies
- Communication (Advanced)
- Leadership (Intermediate)
- Gestion de Projet (Advanced)
- Analyse de Données (Intermediate)

### Qualiopi Indicators
- **1.1** - Information du public (95% compliant)
- **2.1** - Analyse du besoin (88% compliant)
- **3.1** - Adéquation des moyens (75% in progress)

### Satisfaction Surveys
- 1 completed survey with 5/5 rating

---

## 🚀 Quick Start

1. **Seed the database:**
   ```bash
   npm run seed:demo
   ```

2. **Login to the application:**
   - Go to: https://app.bilancompetence.ai/login
   - Use one of the demo accounts above

3. **Explore features:**
   - Admin: Full system access
   - Consultant: Client and assessment management
   - Client: Take assessments and view results

---

## 🔄 Resetting Demo Data

To reset demo data, run:

```bash
# Delete demo accounts
npm run seed:demo:clean

# Re-seed demo data
npm run seed:demo
```

---

**Last Updated:** October 28, 2025  
**Version:** 1.0.0

