import Image from 'next/image';
import LandingImage from '../../icons/landing/mainImage.svg';
import GithubLogo from '../../icons/landing/github.svg';
import { useRouter } from 'next/navigation';

export function LandingPage() {
    const router = useRouter();
    return (
        <div className='flex flex-col h-screen w-full border gap-20 pt-5'>
            <div className='flex justify-end w-full pr-5'>
                <div onClick={() => window.open('https://github.com/shivchauhan795/draw-app', '_blank')} className='flex items-center gap-1 cursor-pointer'>
                    <Image src={GithubLogo} alt="github logo" className='w-5 h-5 min-w-5 min-h-5 object-contain shrink-0' />
                    <h3 className='text-xl font-bold'>Contribute</h3>
                </div>
            </div>
            <div className='flex flex-col justify-center items-center'>
                <Image src={LandingImage} alt="Landing Image" />
                <h1 className="text-5xl font-extrabold mt-7">Draw App</h1>
                <h2 className="text-3xl font-semibold mt-6">Draw with your friends</h2>
                <div className='flex gap-9 mt-10'>
                    <div onClick={() => {
                        router.push('/signin');
                    }} className='border py-2 px-10 text-lg font-semibold rounded-lg shadow-xl bg-[#ffe599] text-black cursor-pointer hover:bg-[#fcdf8a]'>Sign In</div>
                    <div onClick={() => {
                        router.push('/signup');
                    }} className='border py-2 px-10 text-lg font-semibold rounded-lg shadow-xl bg-[#d3ffd2] text-black cursor-pointer hover:bg-[#bcfabb]'>Sign Up</div>
                </div>
            </div>
        </div>
    );
}