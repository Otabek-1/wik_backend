n=int(input())
x1,y1=map(int,input().split())
x2,y2=map(int,input().split())
res=[]
while x1!=x2 and y1!=y2:
    if x1<x2:
        x1+=1
        res.append('R')
    elif x1>x2:
        x1-=1
        res.append("L")
    if y1<y2:
        y1+=1
        res.append('U')
    elif y1>y2:
        y1-=1
        res.append('D')
print(res)
    