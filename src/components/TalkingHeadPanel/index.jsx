import react from 'react';
import CharacterCard from '../CharacterCard';
import BaseHeading from '../BaseHeading';

function TalkingHeadPanel({ talkingHeads }) {

    return (
        <div className={``}>
            <BaseHeading text="Character Dialogue Analysis" className="mb-1" />

            <div className="flex flex-col gap-4">
                {talkingHeads.map((char, i) => (
                    <CharacterCard key={i} character={char} />
                ))}
            </div>

        </div>
    );
}

export default TalkingHeadPanel;