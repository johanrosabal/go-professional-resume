
const fs = require('fs');
const skillsData = {
    "Technical Skills": [
        ["Ability handling problems", "Capacidad para resolver problemas"],
        ["Achievement oriented", "Orientado a logros"],
        ["Creation of Automation Tools for Testing with VB, JAVA or PHP", "Creación de herramientas de automatización para pruebas con VB, JAVA o PHP"],
        ["Collaborative", "Colaborativo"],
        ["Creative finding bugs", "Creativo en la búsqueda de errores"],
        ["Driving for results", "Enfocado a resultados"],
        ["Excellent Inspection techniques", "Excelentes técnicas de inspección"],
        ["Knowledge of General QA principles", "Conocimiento de principios generales de QA"],
        ["Organized and Disciplined", "Organizado y disciplinado"],
        ["Proactive and communicative", "Proactivo y comunicativo"],
        ["Willingness to work as a team member", "Disposición para trabajar en equipo"],
        ["Testing for Mobile Applications", "Pruebas para aplicaciones móviles"],
        ["Always looking for improvement internal procedures and process", "Mejora continua de procesos y procedimientos internos"],
        ["Willingness to learn new technologies", "Disposición para aprender nuevas tecnologías"],
        ["Pixel Perfect Experience", "Experiencia en Pixel Perfect"],
        ["Web Pages Programing (CSS, JavaScript, HTML5)", "Programación de páginas web (CSS, JavaScript, HTML5)"]
    ],
    "Technical knowledge": [
        ["JavaScript, NodeJS", "JavaScript, NodeJS"],
        ["Programing on Android Studio", "Programación en Android Studio"],
        ["jQuery (Basics)", "jQuery (Básico)"],
        ["C# (Basics)", "C# (Básico)"],
        ["CSS 2.0 | CSS3", "CSS 2.0 | CSS3"],
        ["Java", "Java"],
        ["Slack", "Slack"],
        ["Selenium Automation with JAVA", "Automatización con Selenium y JAVA"],
        ["Cypress.io", "Cypress.io"],
        ["Markup Languages: HTML 4.0| XHTML| HTML5|XML", "Lenguajes de Marcado: HTML 4.0 | XHTML | HTML5 | XML"],
        ["Microsoft Office", "Microsoft Office"],
        ["Database: MySQL, PostgreSQL", "Bases de Datos: MySQL, PostgreSQL"],
        ["PHP: Code Igniter HMVC", "PHP: Code Igniter HMVC"],
        ["Visual Basic for Microsoft Applications (Macros Excel. Access)", "Visual Basic para Aplicaciones Microsoft (Macros Excel, Access)"],
        ["Programming Oriented Objects (VB, JAVA, PHP, C#)", "Programación Orientada a Objetos (VB, JAVA, PHP, C#)"],
        ["Media queries (Responsive Design)", "Media queries (Diseño Responsivo)"],
        ["Double Click Banners HTML5 and FLASH validation", "Banners Double Click HTML5 y validación FLASH"],
        ["Firebase (Google)", "Firebase (Google)"],
        ["React Programing 10 months.", "Programación en React (10 meses)"],
        ["Git Hub", "GitHub"]
    ],
    "Software": [
        ["Adobe Dreamweaver", "Adobe Dreamweaver"],
        ["Sublime Text", "Sublime Text"],
        ["Wamp (SQL, Tomcat and PHP)", "Wamp (SQL, Tomcat y PHP)"],
        ["Microsoft Office", "Microsoft Office"],
        ["Microsoft Visio", "Microsoft Visio"],
        ["Jenkins", "Jenkins"],
        ["Linux (Basic)", "Linux (Básico)"],
        ["Eclipse, Visual Studio Code", "Eclipse, Visual Studio Code"],
        ["IntelliJ IDE", "IntelliJ IDE"],
        ["MySQL Workbench", "MySQL Workbench"],
        ["Charles Tracking Tool", "Charles Tracking Tool"],
        ["Screen Hunter", "Screen Hunter"],
        ["Win Merge", "Win Merge"],
        ["Dunk Link Capture Software", "Dunk Link Capture Software"],
        ["JIRA Bug Tracking Tool", "JIRA Bug Tracking Tool"],
        ["JMeter", "JMeter"]
    ]
};

const categoryMap = {
    "Technical knowledge": { es: "Conocimientos Técnicos", en: "Technical Knowledge" },
    "Technical Skills": { es: "Habilidades Profesionales", en: "Technical Skills" },
    "Software": { es: "Software & Herramientas", en: "Software & Tools" }
};

const finalSkills = [];
const ts = Date.now().toString().slice(-4);

Object.entries(skillsData).forEach(([originalCat, items]) => {
    const cats = categoryMap[originalCat];
    items.forEach(([enName, esName], index) => {
        const id = `SK_${originalCat.substring(0, 3).toUpperCase()}_${ts}${index}`.replace(/\s/g, "");
        finalSkills.push({
            id: id,
            name: esName,
            category: cats.es,
            translations: {
                en: {
                    name: enName,
                    category: cats.en
                }
            }
        });
    });
});

fs.writeFileSync('skills_to_import.json', JSON.stringify(finalSkills, null, 2));
