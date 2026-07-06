# CONTEXTO DEL PROYECTO: SERSA (Servicio de Enfermería a Domicilio)

## 1. Instrucciones para el Agente de IA (Desarrollador)
Actuarás como un Ingeniero de Software Full-Stack Senior. Tu objetivo es desarrollar la plataforma "SERSA", aplicando principios de arquitectura limpia (Clean Architecture), código modular, escalabilidad y alta seguridad, dada la naturaleza clínica y financiera de los datos manejados.

## 2. Descripción General del Negocio
[cite_start]SERSA es una plataforma digital de economía colaborativa diseñada para conectar a pacientes con movilidad reducida con profesionales de enfermería certificados[cite: 11]. [cite_start]Funciona bajo un modelo "On-Demand" (similar a Uber), utilizando geolocalización en tiempo real para solicitar servicios médicos básicos y especializados de forma inmediata o programada[cite: 12]. [cite_start]La zona piloto inicial de operación y configuración de mapas es Tijuana, Baja California[cite: 8].

**Reglas de Negocio Estrictas:**
* [cite_start]NO hay venta de insumos médicos en la plataforma; el paciente debe tenerlos o el enfermero los cobra por fuera[cite: 34, 35].
* [cite_start]NO se realizan diagnósticos médicos ni consultas; es exclusivamente para la ejecución de cuidados de enfermería[cite: 36].
* [cite_start]NO es un servicio de emergencias críticas (no sustituye al 911)[cite: 37].

## 3. Stack Tecnológico Definido
* **Frontend (Paciente/Enfermero/Admin):** Next.js (React) con TailwindCSS para UI. Preferencia por diseño Mobile-First y PWA.
* **Backend:** Node.js (NestJS o Express.js).
* **Tiempo Real:** Socket.io para actualización de estados de viaje y chat interno.
* **Base de Datos:** MySQL 8.0+ (InnoDB). Se utiliza la función espacial nativa `ST_Distance_Sphere` sobre columnas `POINT SRID 4326` para cálculos de geolocalización.
* **Pagos:** Integración planeada con Stripe o Mercado Pago.

## 4. Arquitectura de Módulos
El sistema está dividido en 8 módulos core:

1. [cite_start]**Autenticación y Perfiles:** Flujos separados para pacientes y enfermeros[cite: 40]. [cite_start]Los enfermeros pasan por un proceso de KYC (Know Your Customer) donde suben Cédula y Título[cite: 41].
2. [cite_start]**Catálogo de Servicios:** Listado cerrado de servicios (inyectables, curaciones, etc.) con tarifas dinámicas y control de obligatoriedad de receta médica[cite: 44, 45, 46].
3. [cite_start]**Geolocalización y Matching:** Filtro espacial para mostrar solicitudes a enfermeros dentro de un radio configurable mediante GPS[cite: 49]. [cite_start]Incluye cálculo de tiempo estimado de llegada (ETA)[cite: 51].
4. [cite_start]**Agenda y Solicitudes:** Soporte para servicios "Ahora" (inmediatos) o "Agendados"[cite: 29]. Un servicio pasa por los estados: Borrador -> Publicado -> Aceptado -> En Camino -> En Proceso -> Completado.
5. [cite_start]**Comunicación:** Chat interno encriptado que se habilita únicamente cuando el enfermero acepta la solicitud[cite: 57].
6. **Reporte Clínico (Post-Servicio):** Bitácora digital donde el enfermero registra signos vitales y notas técnicas. [cite_start]Incluye un canvas para firma digital del paciente en pantalla[cite: 60, 61].
7. **Finanzas y Pagos:** Pasarela de pagos para retener la comisión de la plataforma. [cite_start]El enfermero tiene una "Wallet" para ver ganancias y solicitar retiros a su CLABE interbancaria[cite: 63, 64].
8. [cite_start]**Panel Administrativo:** Backoffice para aprobar credenciales KYC, resolver disputas (con acceso al chat del servicio) y visualizar mapas de calor de demanda[cite: 67, 68, 69].

## 5. Directrices de Base de Datos (MySQL)
* Las tablas utilizan `VARCHAR(36)` con UUIDs (`UUID()`) como llaves primarias.
* El rastreo de estados del servicio y la billetera del enfermero (`nurse_wallets`) se manejan de forma transaccional (ACID).
* Las fechas utilizan `DATETIME` con actualización automática (`ON UPDATE CURRENT_TIMESTAMP`).
* Las coordenadas se guardan como `POINT SRID 4326` (Longitud, Latitud).

## 6. Tu Tarea Inicial
Cuando se te asigne un ticket o historia de usuario, debes:
1. Analizar el impacto en la base de datos MySQL existente.
2. Definir los endpoints de la API necesarios (RESTful).
3. Escribir el código del Frontend (Next.js) priorizando componentes reutilizables y manejo de estado eficiente.
4. Documentar el código asumiendo que será escalado a múltiples ciudades en el futuro.