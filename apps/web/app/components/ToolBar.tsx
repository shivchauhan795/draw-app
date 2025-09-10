import RectangleIcon from '../icons/rectangle.svg';
import RectangleIconFilled from '../icons/rectangle_filled.svg';
import CircleIcon from '../icons/circle.svg';
import CircleIconFilled from '../icons/circle_filled.svg';
import HandIcon from '../icons/hand.svg';
import HandIconFilled from '../icons/hand_filled.svg';
import TextIcon from '../icons/text.svg';
import TextIconFilled from '../icons/text_filled.svg';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { stateContext } from '../utils/context/stateContext';

const Icons = [
    { icon: HandIcon, filledIcon: HandIconFilled, name: "Pan", key: "1" },
    { icon: RectangleIcon, filledIcon: RectangleIconFilled, name: "Rectangle", key: "2" },
    { icon: CircleIcon, filledIcon: CircleIconFilled, name: "Circle", key: "3" },
    { icon: TextIcon, filledIcon: TextIconFilled, name: "Text", key: "4" },
];

const Toolbar = () => {

    const { isSelected, setIsSelected } = stateContext();

    useEffect(() => {
        const onkeydown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsSelected("");
            } else if (e.key === Icons[0]?.key) {
                setIsSelected("Pan");
            } else if (e.key === Icons[1]?.key) {
                setIsSelected("Rectangle");
            } else if (e.key === Icons[2]?.key) {
                setIsSelected("Circle");
            } else if (e.key === Icons[3]?.key) {
                setIsSelected("Text");
            }
        }
        window.addEventListener("keydown", onkeydown);
        return () => {
            window.removeEventListener("keydown", onkeydown);
        }
    }, [onkeydown]);

    return (
        <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 bg-[#36363a] text-white rounded-xl border border-[#232329] py-1 px-4'>
            {
                Icons.map((item, index) => {
                    return (
                        <button
                            key={index}
                            className={`relative p-2 transition-colors rounded-lg cursor-pointer outline-none ${isSelected === item.name ? "bg-[#403e6a]" : "hover:bg-[#424245]"}`}
                            title={item.name}
                            onClick={() => {
                                setIsSelected(item.name);
                            }}
                        >
                            <Image
                                src={isSelected === item.name ? item.filledIcon : item.icon}
                                alt={item.name}
                                className='w-4 h-4 min-w-4 min-h-4 object-contain shrink-0 m-0.5'
                            />
                            <span className='absolute bottom-0.5 right-1 text-[8px] font-medium'>{item.key}</span>
                        </button>
                    )
                })
            }
        </div>
    )
}

export default Toolbar;