const fs = require('fs');
const path = require('path');

const localPath = path.join(__dirname, 'frontend/src/data/scheme.json');
const targetPath = path.join(__dirname, 'backend/data/schemes.json');

try {
    const rawData = fs.readFileSync(localPath, 'utf8');
    const localSchemes = JSON.parse(rawData);

    const converted = localSchemes.map(s => ({
        id: s.id,
        title: { en: s.name, ta: s.name },
        department: { en: "Official Scheme Portal", ta: "Official Scheme Portal" },
        eligibility: { en: s.desc, ta: s.desc },
        benefits: { en: s.desc, ta: s.desc },
        apply: { en: `Apply with: ${s.docs.join(", ")}`, ta: "Apply online" },
        category: [s.category.toLowerCase()],
        tags: s.why.map(t => t.toLowerCase()),
        requiredDocs: s.docs,
        minAge: 0,
        maxAge: 100,
        maxIncome: 2000000,
        link: "https://www.india.gov.in/my-government/schemes"
    }));

    fs.writeFileSync(targetPath, JSON.stringify(converted, null, 2), 'utf8');
    console.log('Successfully synced 20 schemes to backend.');
} catch (err) {
    console.error('Sync failed:', err);
}
