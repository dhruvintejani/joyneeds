import assert from "node:assert/strict";
import test from "node:test";
import { calculateDiscount,couponSchema } from "../src/services/couponService.js";
import { quoteOrder } from "../src/services/orderService.js";
import { prisma } from "../src/config/prisma.js";
import { env } from "../src/config/env.js";
import { contentSchema,defaultContent } from "../src/controllers/adminStoreController.js";
test("coupon validation and server pricing",async()=>{
  assert.equal(couponSchema.safeParse({code:"bad space",percentOff:10,minSubtotalPaise:0,active:true,expiresAt:null}).success,false);
  assert.equal(couponSchema.safeParse({code:"VALID",percentOff:100,minSubtotalPaise:0,active:true,expiresAt:null}).success,false);
  assert.equal(calculateDiscount(19999,{percentOff:15,minSubtotalPaise:0,active:true,expiresAt:null}),2999);
  assert.throws(()=>calculateDiscount(100,{percentOff:10,minSubtotalPaise:200,active:true,expiresAt:null}));
  assert.throws(()=>calculateDiscount(100,{percentOff:10,minSubtotalPaise:0,active:true,expiresAt:new Date(0)}));
  assert.throws(()=>calculateDiscount(100,{percentOff:10,minSubtotalPaise:0,active:false,expiresAt:null}));
  const product=await prisma.product.findFirstOrThrow({where:{active:true,stockStatus:"IN_STOCK"}});
  const coupon=await prisma.coupon.create({data:{code:"TEST-"+Date.now(),percentOff:10,minSubtotalPaise:0}});
  try {const result=await quoteOrder({items:[{productId:product.id,quantity:1}],couponCode:coupon.code});
    assert.equal(result.discountPaise,Math.floor(product.pricePaise/10));
    assert.equal(result.totalPaise,product.pricePaise+env.SHIPPING_FEE_PAISE-result.discountPaise);
    await prisma.coupon.update({where:{id:coupon.id},data:{active:false}});
    await assert.rejects(quoteOrder({items:[{productId:product.id,quantity:1}],couponCode:coupon.code}));
  } finally {await prisma.coupon.delete({where:{id:coupon.id}});}
});
test("homepage content is bounded, plain text and retains default copy",()=>{assert.equal(contentSchema.safeParse(defaultContent).success,true);assert.equal(contentSchema.safeParse({...defaultContent,heroTitle:"x".repeat(51)}).success,false);});
