# Dudas de atributos y nombres por revisar

Atributos y nombres colombianos generados por familia el 2026-10-29. Estas son las especies donde el modelo no estaba seguro. Corrige en `content/aves/atributos/<familia>.json` o `content/aves/nombres-colombia.json`.

## Lote 1

83 especies, 12 familias. El validador da 0 errores.

Datos dudosos:
1. Cranioleuca erythrops (2485336): nombre "Rastrojero carirrufo" sin confirmar; puede que el estándar ACO sea otro (p. ej. "Chamicero"). También son dudosos los nombres de Synallaxis azarae ("Rastrojero de Azara") y Synallaxis subpudica ("Rastrojero bogotano").
2. Premnoplex brunnescens (2485279): nombre "Subepalo moteado".
3. Certhiaxis cinnamomeus (2486060): nombre "Rastrojero barbiamarillo"; también altitudM [0, 1000].
4. Columbina passerina (2495869): nombre "Tortolita pechiescamada".
5. Turdus nudigenis (2490763): nombre "Mirla ojidesnuda".
6. Progne tapera (2489136): residencia "residente", porque hay población residente además de migrantes australes. Nombre "Golondrina sabanera" sin confirmar.
7. Momotus subrufescens (7342297): nombre "Barranquero caribeño". Momotus momota (2475290): "Barranquero coroniazul".
8. Streptoprocne zonaris (2477082): nombre "Vencejo collarejo". Tachornis squamata (2477436): "Vencejo palmero".
9. Xiphocolaptes promeropirhynchus (2485461): altitudM [0, 3000], rango amplio porque está en tierras bajas y en los Andes. Nombre "Trepatroncos gigante".
10. Leptosittaca branickii (2480179): nombre "Perico paramuno". Amazona mercenaria (2479636): "Lora andina". Glaucidium brasilianum (5232118): "Buhíto ferrugíneo".

Archivos:
- Un archivo por familia en /Users/sergiomonsalve/Code/sergiomonsalve.com/content/aves/atributos/: furnariidae, psittacidae, columbidae, turdidae, hirundinidae, apodidae, momotidae, laridae, strigidae, jacanidae, nyctibiidae y anhingidae (.json). Si ya existían, agregué mis especies sin borrar lo que tenían.
- Nombres: /Users/sergiomonsalve/Code/sergiomonsalve.com/.superpowers/sdd/2026-10-29-guia-aves-catalogo-web/lotes/nombres-5.json

## Lote 2

83 especies cubiertas, 12 familias. El validador da 0 errores.

Datos dudosos:
1. Vireo olivaceus (2487430): residencia. Puse "migratoria-boreal", pero los registros de GBIF pueden incluir la población residente de *chivi*.
2. Quiscalus mexicanus (9476062): nombre "María mulata", que puede no coincidir con el nombre de la ACO. También dudo del máximo de altitud (1600 m).
3. Psarocolius angustifrons (2484222): nombre "Oropéndola dorsirrojiza". Además, el tamaño de 42 cm promedia macho y hembra (47 y 35 cm) y la deja en "gallinazo".
4. Gymnomystax mexicanus (2484109): nombre "Turpial lagunero".
5. Cacicus uropygialis (5229817): nombre "Arrendajo escarlata". La altitud [0, 2200] mezcla poblaciones de tierras bajas y subandinas.
6. Cacicus chrysonotus (5229822): nombre "Cacique montañero".
7. Cyanocorax yncas (2482565): nombre "Carriquí de montaña".
8. Colaptes rubiginosus (7340161) "Carpintero olivo" y Colaptes rivolii (7340159) "Carpintero candela": nombres.
9. Cistothorus platensis (2493890): nombre "Cucarachero sabanero" y mínimo de altitud (2000 m).
10. Cacicus cela (5229832): tamanoCm 26, en el límite entre "mirla" y "paloma". Quiscalus lugubris (2484159) está en el mismo caso con 25 cm.

Archivos de atributos en /Users/sergiomonsalve/Code/sergiomonsalve.com/content/aves/atributos/:
- icteridae.json
- troglodytidae.json
- picidae.json
- ardeidae.json
- threskiornithidae.json
- vireonidae.json
- corvidae.json
- bucconidae.json
- odontophoridae.json
- galbulidae.json
- recurvirostridae.json
- anhimidae.json

Nombres en /Users/sergiomonsalve/Code/sergiomonsalve.com/.superpowers/sdd/2026-10-29-guia-aves-catalogo-web/lotes/nombres-6.json

## Lote 3

83 especies cubiertas, 12 familias. El validador da 0 errores.

Datos de los que no estoy seguro:
1. Myioborus miniatus: nombre ("Abanico pechinegro"; en la lista de la ACO podría ser "Candelita ...").
2. Thamnophilus multistriatus: nombre ("Batará carcajada").
3. Dysithamnus mentalis: nombre ("Hormiguero tiznado").
4. Pteroglossus castanotis: nombre ("Pichí castaño").
5. Ramphastos ambiguus: nombre ("Tucán pechiamarillo"; también se usa "Tucán de Swainson").
6. Ramphastos sulfuratus: nombre ("Tucán pico iris").
7. Andigena nigrirostris: nombre ("Terlaque pechiazul").
8. Atlapetes, todo el género: el patrón de nombre "Gorrión montés ..." y la altitud de A. crassus [600, 2000] y A. albinucha [800, 2800].
9. Buteo platypterus: tamanoCm (39 cm, que da "paloma"; algunas guías dan 40 o más, que daría "gallinazo"). Lo mismo pasa con Buteo nitidus (41 cm).
10. Setophaga castanea: colores. Usé el macho reproductivo (cafe, negro, blanco), pero en Colombia se ve sobre todo con plumaje no reproductivo verdoso.

Archivos:
- /Users/sergiomonsalve/Code/sergiomonsalve.com/content/aves/atributos/{parulidae,passerellidae,accipitridae,thamnophilidae,ramphastidae,anatidae,rallidae,alcedinidae,charadriidae,grallariidae,pelecanidae,cinclidae}.json
- /Users/sergiomonsalve/Code/sergiomonsalve.com/.superpowers/sdd/2026-10-29-guia-aves-catalogo-web/lotes/nombres-4.json

## Lote 4

Especies cubiertas: 84. El validador da 0 errores.

Familias: 9 (tyrannidae, fringillidae, pipridae, falconidae, rhinocryptidae, polioptilidae, caprimulgidae, podicipedidae, semnornithidae).

Especies con algún dato dudoso:
1. Myiodynastes hemichrysus (2483489), todos los atributos: esta especie es de Costa Rica y Panamá. Los registros de Colombia seguramente son de M. chrysocephalus, y usé sus datos.
2. Tyrannus savana (5229693), residencia: puse "residente" porque hay poblaciones que crían en el Caribe y en los Andes, pero muchas aves son migrantes australes. tamanoCm=38 corresponde al macho con su cola larga.
3. Tyrannus dominicensis (5229678), residencia: puse "residente" porque cría en el Caribe y en San Andrés, pero en invierno llegan muchos migrantes boreales.
4. Megarynchus pitangua (2483410), nombre: "Bichofué picudo". En otras fuentes aparece como "Picón".
5. Falco rufigularis (2481033), tamanoCm: puse 25 (clase mirla). El rango va de 23 a 28 cm, así que según el sexo podría quedar en la clase paloma.
6. Falco sparverius (9685907), tamanoCm: puse 25, justo en el límite entre mirla y paloma.
7. Nombres de tiránidos poco comunes (Lophotriccus pileatus, Leptopogon superciliaris, Mionectes galbinus, Myiotriccus ornatus): no estoy seguro de que coincidan exactamente con la lista de la Asociación Colombiana de Ornitología.
8. Spinus psaltria (5231647), nombre: "Jilguero menor". En Colombia también se usa "Chisga".
9. Machetornis rixosa (2482934), altitudM: puse un máximo de 2600 m porque la especie se ha extendido a la Sabana de Bogotá. Antes no pasaba de unos 1000 m.
10. Scytalopus griseicollis (2490998), nombre: "Tapaculo rabirrufo" es incierto. También revisé que no es endémica, porque llega a Venezuela.

Archivos:
- /Users/sergiomonsalve/Code/sergiomonsalve.com/content/aves/atributos/{tyrannidae,fringillidae,pipridae,falconidae,rhinocryptidae,polioptilidae,caprimulgidae,podicipedidae,semnornithidae}.json
- /Users/sergiomonsalve/Code/sergiomonsalve.com/.superpowers/sdd/2026-10-29-guia-aves-catalogo-web/lotes/nombres-2.json

## Lote 5

83 especies cubiertas en 10 familias. El validador da 0 errores.

Archivos escritos:
- /Users/sergiomonsalve/Code/sergiomonsalve.com/content/aves/atributos/trochilidae.json, cotingidae.json, cracidae.json, cuculidae.json, cardinalidae.json, trogonidae.json, capitonidae.json, phalacrocoracidae.json, fregatidae.json y opisthocomidae.json
- /Users/sergiomonsalve/Code/sergiomonsalve.com/.superpowers/sdd/2026-10-29-guia-aves-catalogo-web/lotes/nombres-3.json

Datos dudosos:
1. Thalurania colombica (2476528): nombre "Ninfa coronada"
2. Chaetocercus mulsant (5788533) y Calliphlox mitchellii (2476368): nombres "Rumbito ventriblanco" y "Rumbito de Mitchell"
3. Boissonneaua flavescens (2476787): nombre "Coronita colianteada"
4. Chionomesa fimbriata (10941997): nombre "Amazilia gargantiverde"
5. Colibri cyanotus (9053125): nombre "Chillón verde"
6. Penelope argyrotis (2482208): nombre "Pava canosa"
7. Tapera naevia (5231932): nombre "Tres pies" (también se le dice "Sinfín")
8. Pyroderus scutatus (2486243): tamanoCm 43, un punto medio entre macho (~46) y hembra (~38). Eso deja la clase en el límite entre gallinazo y paloma.
9. Especies de cola larga con tamaño muy distinto entre macho y hembra: Lesbia victoriae 24, Aglaiocercus coelestis 19, Heliodoxa imperatrix 19 y Ocreatus underwoodii 12. Usé el tamaño del macho o un valor intermedio, así que la clase de tamaño puede quedar mal.
10. Lesbia nuna (5228490) y Heliangelus clarisse (9376700): rangos de altitud (altitudM).

## Lote 6

84 especies, 8 familias. Archivos en `/Users/sergiomonsalve/Code/sergiomonsalve.com/content/aves/atributos/` (thraupidae, cathartidae, scolopacidae, tinamidae, mimidae, pandionidae, aramidae, ciconiidae) y `/Users/sergiomonsalve/Code/sergiomonsalve.com/.superpowers/sdd/2026-10-29-guia-aves-catalogo-web/lotes/nombres-1.json`. El validador marca 0 errores (500/500 especies con atributos). Las especies nuevas se agregaron a los archivos por familia sin borrar lo que ya tenían.

Especies con algún dato dudoso:
1. Sicalis flaveola (2491862): altitudM, el máximo de 2600 m incluye poblaciones introducidas o en expansión en la sabana de Bogotá.
2. Tringa flavipes (2481721): tamanoCm 25 está en el límite entre mirla y paloma (las guías dan 23 a 27 cm).
3. Tangara labradorides / Chlorochrysa phoenicotis / C. nitidissima (2488101, 5230596, 5230597): tamanoCm 12,7 queda justo por debajo de 13, así que salen como "colibri".
4. Ramphocelus dimidiatus (2488424): nombre, "Asoma terciopelo" contra "Toche pico de plata" (este último lo usé para R. carbo).
5. Buthraupis montana (2488303): nombre, "Tangara encapuchada" (podría ser "Clarinero encapuchado").
6. Chlorornis riefferii (5230635): nombre, "Tangara esmeralda".
7. Dubusia taeniata (2488325): nombre, "Tangara pechianteada".
8. Dacnis egregia (6100781): nombre ("Dacnis penachiamarillo") y altitudM [0, 1200].
9. Melanospiza bicolor (9426540): altitudM [0, 1500].
10. Tangara labradorides (2488101) / Stilpnia larvata (10955666): nombre, "Tangara verdeplata" y "Tangara capuchidorada".
