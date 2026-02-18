import React, { useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../contexts/mainContext';

import ReactJson from "@uiw/react-json-view";

import DataObjectIcon from '@mui/icons-material/DataObject';
import JsonViewer from '../JsonViewer';

const data = {
    "entities": [
        {
            "id": "video_1",
            "label": "Coorg Travel Guide _ Places To Visit in Coorg _ Budget Travel _ Rentals _ A-Z Details _ Xplainer.mp4",
            "properties": {
                "filename": "Coorg Travel Guide _ Places To Visit in Coorg _ Budget Travel _ Rentals _ A-Z Details _ Xplainer.mp4",
                "format": "travel_guide",
                "language": "en"
            },
            "type": "Video"
        },
        {
            "id": "person_ismail",
            "label": "Ismail",
            "properties": {
                "role": "host"
            },
            "type": "Person"
        },
        {
            "id": "place_mandalpatti_viewpoint",
            "label": "Mandalpatti Viewpoint",
            "properties": {
                "height_ft": 4000,
                "hike_minutes": 5,
                "jeep_ride_minutes": 30,
                "place_type": "viewpoint",
                "shared_jeep_cost_inr_per_person": 500
            },
            "type": "Place"
        },
        {
            "id": "activity_jeep_ride",
            "label": "Jeep ride (Mandalpatti)",
            "properties": {},
            "type": "Activity"
        },
        {
            "id": "activity_hike",
            "label": "Hike",
            "properties": {},
            "type": "Activity"
        },
        {
            "id": "place_kote_betta",
            "label": "Kote Betta",
            "properties": {
                "note": "small Shiva temple at top",
                "peak_height_ft": 5300,
                "place_type": "mountain/trek",
                "trek_distance_km_one_way": 8
            },
            "type": "Place"
        },
        {
            "id": "activity_trek",
            "label": "Trek",
            "properties": {},
            "type": "Activity"
        },
        {
            "id": "place_malalli_falls",
            "label": "Malalli Falls",
            "properties": {
                "note": "short hike to reach",
                "place_type": "waterfall",
                "plunge_m": 200
            },
            "type": "Place"
        },
        {
            "id": "place_taste_of_coorg",
            "label": "Taste of Coorg",
            "properties": {
                "cuisine": "local Coorg cuisine",
                "place_type": "restaurant",
                "price_level": "budget",
                "recommended_meal": "breakfast"
            },
            "type": "Place"
        },
        {
            "id": "place_coorg_cuisine_restaurant",
            "label": "Coorg Cuisine",
            "properties": {
                "cuisine_note": "Coorgi dishes often pork-based",
                "place_type": "restaurant",
                "recommended_dish": "pork chops"
            },
            "type": "Place"
        },
        {
            "id": "food_pork",
            "label": "Pork",
            "properties": {},
            "type": "Food"
        },
        {
            "id": "food_pork_chops",
            "label": "Pork chops",
            "properties": {},
            "type": "Food"
        },
        {
            "id": "place_raintree_restaurant",
            "label": "Raintree Restaurant",
            "properties": {
                "note": "good variety and ambience; good for dinner",
                "place_type": "restaurant",
                "price_level": "expensive"
            },
            "type": "Place"
        },
        {
            "id": "place_ain_mane_cafe",
            "label": "Ain Mane Cafe",
            "properties": {
                "place_type": "cafe/specialty_store",
                "sells": [
                    "coffee",
                    "spices"
                ]
            },
            "type": "Place"
        },
        {
            "id": "beverage_coffee",
            "label": "Coffee",
            "properties": {},
            "type": "Beverage"
        },
        {
            "id": "product_spices",
            "label": "Spices",
            "properties": {},
            "type": "Product"
        },
        {
            "id": "place_namdrolling_monastery",
            "label": "Namdrolling Monastery",
            "properties": {
                "established_year": 1963,
                "lineage": "Nyingma",
                "place_type": "monastery",
                "residents": "monks and nuns",
                "residents_count": 5000,
                "tradition": "Tibetan Buddhism"
            },
            "type": "Place"
        },
        {
            "id": "religion_tibetan_buddhism",
            "label": "Tibetan Buddhism",
            "properties": {},
            "type": "Religion"
        },
        {
            "id": "lineage_nyingma",
            "label": "Nyingma lineage",
            "properties": {
                "religion": "Tibetan Buddhism"
            },
            "type": "ReligiousLineage"
        },
        {
            "id": "person_buddha_shakyamuni",
            "label": "Buddha Shakyamuni",
            "properties": {
                "role": "founder_figure",
                "tradition": "Buddhism"
            },
            "type": "Person"
        },
        {
            "id": "place_dubare_elephant_camp",
            "label": "Dubare Elephant Camp",
            "properties": {
                "entry_fee_inr": 50,
                "note": "river crossing required; carry cash",
                "open_hours_evening": "16:30-17:30",
                "open_hours_morning": "09:00-11:00",
                "place_type": "elephant_camp"
            },
            "type": "Place"
        },
        {
            "id": "topic_river_crossing",
            "label": "River crossing",
            "properties": {
                "methods": [
                    "on foot (seasonal)",
                    "boat (seasonal)"
                ]
            },
            "type": "Topic"
        }
    ],
    "properties": {
        "extraction_notes": [
            "Some place names in transcript appear with minor ASR spelling variants (e.g., 'Malikere' interpreted as 'Madikeri').",
            "Transcript cuts off after Dubare Elephant Camp segment; east-side list likely incomplete."
        ],
        "graph_type": "knowledge_graph",
        "source": "video_metadata_transcription_and_frames"
    },
    "relationships": [
        {
            "label": "host",
            "source": "video_1",
            "target": "person_ismail",
            "type": "FEATURES"
        },
        {
            "label": "from",
            "source": "person_ismail",
            "target": "org_explore_the_earth",
            "type": "AFFILIATED_WITH"
        },
        {
            "label": "travel guide for",
            "source": "video_1",
            "target": "place_coorg",
            "type": "ABOUT"
        },
        {
            "label": "district in",
            "source": "place_coorg",
            "target": "place_karnataka",
            "type": "LOCATED_IN"
        },
        {
            "label": "alternate name",
            "source": "place_kodagu",
            "target": "place_coorg",
            "type": "SAME_AS"
        },
        {
            "label": "houses",
            "source": "place_fort_church_museum",
            "target": "place_madikeri_fort",
            "type": "PART_OF"
        },
        {
            "label": "houses",
            "source": "place_clock_tower",
            "target": "place_madikeri_fort",
            "type": "PART_OF"
        },
        {
            "label": "houses",
            "source": "place_elephant_statues",
            "target": "place_madikeri_fort",
            "type": "PART_OF"
        },
        {
            "label": "houses",
            "source": "place_kote_ganpati_temple",
            "target": "place_madikeri_fort",
            "type": "PART_OF"
        },
        {
            "label": "direction referenced",
            "source": "place_somwarpet",
            "target": "place_madikeri",
            "type": "NORTH_OF"
        }
    ]
};

const KnowledgeGraphModal = ({ show, onHide }) => {

    const { theme } = useContext(MainContext);

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            className="graph-modal p-0 flex-1"
        >
            <Modal.Header closeButton className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white !border-b-textColor-200'}`}>
                <Modal.Title id="contained-modal-title-vcenter">
                    <div className="flex items-center gap-1">
                        <DataObjectIcon className={`${theme === 'dark' && 'text-textColor-200'}`} fontSize="large" />
                        <p>JSON Structure</p>
                    </div>
                    {/* JSON/Graph switched */}
                    {/* ... */}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body
                className={`
    ${theme === 'light' ? '' : 'bg-textColor-300 text-white'}
    p-0
  `}
            >
                <div className="flex flex-col h-[60vh]">

                    {/* Scrollable JSON Container */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className={`
        ${theme === "light" ? 'bg-[#f5f5f5]' : 'bg-[#222]'}
        rounded-lg
        min-h-full
      `}>
                            <JsonViewer data={data} />
                        </div>
                    </div>

                </div>
            </Modal.Body>

            <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Ok</span>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default KnowledgeGraphModal;