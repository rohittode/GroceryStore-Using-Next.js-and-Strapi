"use client"
import { Button } from '@/components/ui/button'
import { CircleUserRound, LayoutGrid, Search, ShoppingBasket } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState, useContext } from 'react'
import GlobalApi from '../_utils/GlobalApi'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UpdateCartContext } from "../_context/UpdateCartContext";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import CartItemList from './CartItemList'
import { toast } from 'sonner'

function Header() {
    const [categoryList, setCategoryList] = useState([]);
    const [isLogin, setIsLogin] = useState(false);
    const [user, setUser] = useState(null);
    const [jwt, setJwt] = useState(null);
    const [totalCartItems, setTotalCartItem] = useState(0);
    const { updateCart, setUpdateCart } = useContext(UpdateCartContext)
    const [cartItemList, setCartItemList] = useState([]);

    const router = useRouter();

    useEffect(() => {
        // This code runs only on the client side
        const jwtToken = sessionStorage.getItem('jwt');
        const userData = sessionStorage.getItem('user');

        setIsLogin(!!jwtToken);
        setUser(userData ? JSON.parse(userData) : null);
        setJwt(jwtToken);
    }, []);

    useEffect(() => {
        getCategoryList();
    }, [])

    useEffect(() => {
        if (isLogin) {
            getCartItems();
        }
    }, [updateCart, isLogin])

    // Get Category List
    const getCategoryList = () => {
        GlobalApi.getCategory().then(resp => {
            setCategoryList(resp.data.data);
        })
    }

    // Get Cart Items
    const getCartItems = async () => {
        // Check if user and user.id are defined
        if (user && user.id) {
            try {
                const cartItemList_ = await GlobalApi.getCartItems(user.id.jwt);
                console.log(cartItemList_);
                setTotalCartItem(cartItemList_?.length || 0); // Ensure length is 0 if cartItemList_ is undefined
                setCartItemList(cartItemList_ || []); // Ensure cartItemList_ is an empty array if it's undefined
            } catch (error) {
                console.error("Error fetching cart items:", error);
                // Optionally set default state in case of error
                setTotalCartItem(0);
                setCartItemList([]);
            }
        } else {
            // Handle the case where user is not logged in
            console.log("User is not logged in");
            setTotalCartItem(0);
            setCartItemList([]);
        }
    };

    const onSignOut = () => {
        sessionStorage.clear();
        router.push('/sign-in');
    }

    const onDeleteItem = (id) => {
        GlobalApi.deleteCartItem(id, jwt).then(resp => {
            toast('Item removed!');
            getCartItems();
        })
    }

    const [subtotal, setSubTotal] = useState(0);

    useEffect(() => {
        let total = 0;
        cartItemList.forEach(element => {
            total = total + element.amount;
        });
        setSubTotal(total.toFixed(2));
    }, [cartItemList]);

    return (
        <div className='p-5 shadow-sm flex justify-between'>
            <div className='flex items-center gap-8'>
                <Link href={'/'}><Image src='/logo.png' alt='logo' width={150} height={100} className='cursor-pointer' /></Link>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <h2 className='hidden md:flex gap-2 items-center border rounded-full p-2 px-10 bg-slate-200 cursor-pointer'>
                            <LayoutGrid className='h-5 w-5' /> Category
                        </h2>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Browse Category</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {categoryList.map((category, index) => (
                            <Link key={index} href={'/products-category/' + category.attributes.name}>
                                <DropdownMenuItem className="flex gap-4 items-center cursor-pointer">
                                    <Image src={
                                        process.env.NEXT_PUBLIC_BACKEND_BASE_URL +
                                        category?.attributes?.icon?.data[0]?.attributes?.url}
                                        unoptimized={true}
                                        alt='icon'
                                        width={30}
                                        height={30} />
                                    <h2 className='text-lg'>{category?.attributes?.name}</h2>
                                </DropdownMenuItem>
                            </Link>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className='md:flex gap-3 items-center border rounded-full p-2 px-5 hidden'>
                    <Search />
                    <input type='text' placeholder='Search' className='outline-none' />
                </div>
            </div>
            <div className='flex gap-8 items-center'>
                <Sheet>
                    <SheetTrigger>
                        <h2 className='flex gap-2 items-center text-lg'>
                            <ShoppingBasket className='h-7 w-7' />
                            <span className='bg-primary text-white px-2 rounded-full'>{totalCartItems}</span>
                        </h2>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle className="bg-primary text-white font-bold text-lg p-2">My Cart</SheetTitle>
                            <SheetDescription>
                                <CartItemList cartItemList={cartItemList} onDeleteItem={onDeleteItem} />
                            </SheetDescription>
                        </SheetHeader>
                        <SheetClose asChild>
                            <div className='absolute w-[90%] bottom-6 flex flex-col'>
                                <h2 className='text-lg font-bold flex justify-between'>Subtotal <span>₹{subtotal}</span></h2>
                                <Button onClick={() => router.push(jwt ? '/checkout' : '/sign-in')}>Checkout</Button>
                            </div>
                        </SheetClose>
                    </SheetContent>
                </Sheet>

                {!isLogin ? <Link href={'/sign-in'}>
                    <Button>Login</Button>
                </Link>
                    :
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <CircleUserRound className="bg-green-100 p-2 rounded-full cursor-pointer text-primary h-12 w-12" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <Link href={'/my-order'}>
                                <DropdownMenuItem>My Order</DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={onSignOut}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
            </div>
        </div>
    );
}

export default Header;
