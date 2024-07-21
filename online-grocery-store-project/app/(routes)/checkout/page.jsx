"use client"
import GlobalApi from '@/app/_utils/GlobalApi';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PayPalButtons } from '@paypal/react-paypal-js';
import { ArrowBigRight } from 'lucide-react'
import GlobalError from 'next/dist/client/components/error-boundary';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

function page() {

    const user = JSON.parse(sessionStorage.getItem('user'));
    const jwt = sessionStorage.getItem('jwt');
    const [totalCartItems, setTotalCartItem] = useState(0);
    const [cartItemList, setCartItemList] = useState([]);
    const [subtotal, setSubTotal] = useState(0);

    const [username, setUsername] = useState();
    const [email, setEmail] = useState();
    const [phone, setPhone] = useState();
    const [zip, setZip] = useState();
    const [address, setAddress] = useState();

    const [totalAmount, setTotalAmount] = useState(0);

    const router = useRouter();

    useEffect(() => {
        if (!jwt) {
            router.push('/sign-in');
        }
        getCartItems();
    }, []);

    const getCartItems = async () => {
        const cartItemList_ = await GlobalApi.getCartItems(user.id.jwt);
        console.log(cartItemList_);
        setTotalCartItem(cartItemList_?.length);
        setCartItemList(cartItemList_);
    }

    useEffect(() => {
        let total = 0;
        cartItemList.forEach(element => {
            total += element.amount;
        });
        setSubTotal(total.toFixed(2));
        calculateTotalAmount(total);
    }, [cartItemList]);

    const calculateTotalAmount = (subtotal) => {
        const tax = subtotal * 0.12;
        const deliveryCharge = 20;
        const totalAmount = subtotal + tax + deliveryCharge;
        setTotalAmount(totalAmount.toFixed(2));
    }

    const onApprove = (data) => {
        console.log(data);

        const payload = {
            data: {
                paymentId: (data.paymentId).toString(),
                totalOrderAmount: totalAmount,
                username: username,
                email: email,
                phone: phone,
                zip: zip,
                address: address,
                orderItemList: cartItemList,
                userId: user.id
            }
        }

        GlobalApi.createOrder(payload, jwt).then(resp => {
            toast('Order Placed Successfully !');
            cartItemList.forEach((item, index) => {
                GlobalApi.deleteCartItem(item.id).then(resp => {
                })
            })
            router.replace('/order-confirmation');
        })
    }

    return (
        <div className=''>
            <h2 className='p-3 bg-primary font-bold text-center text-white'>Checkout</h2>
            <div className='p-5 px-5 md:px-10 grid grid-cols-1 md:grid-cols-3 py-8'>
                <div className='md:col-span-2 mx-20'>
                    <h2 className='font-bold text-3xl'>Billing Details</h2>
                    <div className='grid grid-cols-2 gap-10 mt-3'>
                        <Input placeholder='Name' onChange={(e) => setUsername(e.target.value)} />
                        <Input placeholder='Email' onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className='grid grid-cols-2 gap-10 mt-3'>
                        <Input placeholder='Phone' onChange={(e) => setPhone(e.target.value)} />
                        <Input placeholder='Zip' onChange={(e) => setZip(e.target.value)} />
                    </div>
                    <div className='mt-3'>
                        <Input placeholder='Address' onChange={(e) => setAddress(e.target.value)} />
                    </div>
                </div>
                <div className='mx-10 border'>
                    <h2 className='p-3 bg-gray-200 font-bold text-center'>Total Cart ({totalCartItems})</h2>
                    <div className='p-4 flex flex-col gap-4'>
                        <h2 className='font-bold flex justify-center'>Subtotal: <span>₹{subtotal}</span></h2>
                        <hr></hr>
                        <h2 className='flex justify-center'>Delivery: <span>₹20.00</span></h2>
                        <h2 className='flex justify-center'>Tax (12%): <span>₹{(subtotal * 0.12).toFixed(2)}</span></h2>
                        <hr></hr>
                        <h2 className='font-bold flex justify-center'>Total: <span>₹{totalAmount}</span></h2>
                        <Button onClick={()=>onApprove({paymentId:123})}>Payment</Button>
                       {totalAmount>15&& <PayPalButtons
                            disabled={!(username && email && address && zip)}
                            style={{ layout: "horizontal" }}
                            onApprove={onApprove}
                            createOrder={(data, actions) => {
                                return actions.order.create({
                                    purchase_units: [
                                        {
                                            amount: {
                                                value: totalAmount,
                                                currency_code: 'USD'
                                            }
                                        }
                                    ]
                                });
                            }}
                        />}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page;
