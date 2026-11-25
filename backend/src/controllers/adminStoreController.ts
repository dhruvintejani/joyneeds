import type { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { couponSchema } from "../services/couponService.js";
import { AppError } from "../utils/AppError.js";
export { couponSchema };
export const couponListQuery = z.object({q:z.string().trim().max(30).optional(),page:z.coerce.number().int().min(1).max(100000).default(1)});
export const listCoupons:RequestHandler = async (_req,res) => {
  const {q,page}=res.locals.validatedQuery as z.infer<typeof couponListQuery>;
  const where=q?{code:{contains:q.toUpperCase()}}:{};
  const [items,total]=await Promise.all([prisma.coupon.findMany({where,orderBy:[{createdAt:"desc"},{id:"desc"}],skip:(page-1)*25,take:25}),prisma.coupon.count({where})]);
  res.set("Cache-Control","no-store").json({data:{items,total,pages:Math.max(1,Math.ceil(total/25)),page}});
};
function couponData(value:z.infer<typeof couponSchema>) {return {...value,expiresAt:value.expiresAt?new Date(value.expiresAt):null};}
function handleCouponError(error:unknown):never {
  if(error && typeof error==="object" && "code" in error) {
    if(error.code==="P2002") throw new AppError(409,"COUPON_EXISTS","This coupon code already exists.");
    if(error.code==="P2025") throw new AppError(404,"COUPON_NOT_FOUND","Coupon not found.");
  }
  throw error;
}
export const createCoupon:RequestHandler=async(_req,res)=>{try{res.status(201).json({data:await prisma.coupon.create({data:couponData(res.locals.validatedBody)})});}catch(error){handleCouponError(error);}};
export const updateCoupon:RequestHandler=async(_req,res)=>{try{res.json({data:await prisma.coupon.update({where:{id:res.locals.validatedParams.id},data:couponData(res.locals.validatedBody)})});}catch(error){handleCouponError(error);}};
export const archiveCoupon:RequestHandler=async(_req,res)=>{try{res.json({data:await prisma.coupon.update({where:{id:res.locals.validatedParams.id},data:{active:false}})});}catch(error){handleCouponError(error);}};
export const contentSchema=z.object({heroEyebrow:z.string().trim().min(1).max(60),heroTitle:z.string().trim().min(1).max(50),heroAccent:z.string().trim().min(1).max(50),heroDescription:z.string().trim().min(1).max(220),announcement:z.string().trim().max(140).nullable()});
export const defaultContent={heroEyebrow:"GOOD FINDS. BETTER EVERYDAYS.",heroTitle:"Make room for",heroAccent:"better everyday.",heroDescription:"Beautifully practical essentials for the spaces you live in and the moments that matter.",announcement:null};
export const getStoreContent:RequestHandler=async(_req,res)=>{const row=await prisma.storeContent.findUnique({where:{id:"home"}});res.set("Cache-Control","no-store").json({data:row?{heroEyebrow:row.heroEyebrow,heroTitle:row.heroTitle,heroAccent:row.heroAccent,heroDescription:row.heroDescription,announcement:row.announcement}:defaultContent});};
export const updateStoreContent:RequestHandler=async(_req,res)=>{const value=res.locals.validatedBody as z.infer<typeof contentSchema>;await prisma.storeContent.upsert({where:{id:"home"},create:{id:"home",...value},update:value});res.json({data:value});};
